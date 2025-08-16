import type { Prisma } from '@prisma/client'
import type { UploadFileInput } from './upload.service'
import type { AmapRegeoCode } from '@/types/amap'
import { wgs84togcj02 } from 'coordtransform'
import exifr from 'exifr'
import { sha256 } from 'hono/utils/crypto'
import { pick } from 'lodash-es'
import { env } from '@/env'
import { getVideoDuration } from '@/lib/ffmpeg'
import { db } from '@/server/db'
import { transformVideoToResponse, videoInclude } from '@/service/asset.service'
import { imageminService } from '@/service/imagemin.service'
import { delete_from_bucket, upload_to_bucket } from '@/service/s3.service'
import { formatBearing } from '@/utils'

export type FileWithBucket = Prisma.FileGetPayload<{
  include: {
    bucket: true
  }
}>

export function getFileUrl(file?: FileWithBucket | null) {
  if (!file) {
    return ''
  }
  const publicUrl = file.bucket.publicUrl
  return `${publicUrl}/${file.path}`
}

export function getFileSize(file?: FileWithBucket | null) {
  if (!file) {
    return 0
  }
  return file.size
}

export async function regeo(location: string) {
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${env.AMAP_KEY}&location=${location}`
  const res = await fetch(url)
  const json = (await res.json()) as AmapRegeoCode
  if (json.status !== '0' && json.infocode !== '10000') {
    throw new Error(json.info)
  }
  return json.regeocode
}

export async function getAddressFromExif(exif?: any) {
  const GPSLatitude = exif?.GPSLatitude
  const GPSLongitude = exif?.GPSLongitude
  let address: any = ''
  if (GPSLatitude && GPSLongitude) {
    const [gcj02Longitude, gcj02Latitude] = wgs84togcj02(formatBearing(GPSLongitude), formatBearing(GPSLatitude))
    const location = `${gcj02Longitude},${gcj02Latitude}`
    const res = await regeo(location)
    address = res.formatted_address
    try {
      if (typeof address !== 'string') {
        address = JSON.stringify(address)
      }
    }
    catch {
      // ignore error
    }
  }
  return address
}

// 异步处理其余图片任务
export async function handleImagePostProcess(options: {
  buffer: ArrayBuffer
  name: string
  type: string
  uploadedBy: string
  isPublic: boolean
  category: string
  imageId: string
}) {
  const { buffer, name, uploadedBy, isPublic, category, imageId } = options
  let thumbnail_768x_image: FileWithBucket | null = null
  let compressed_image: FileWithBucket | null = null
  try {
    // 生成 768x 缩略图
    const thumbnail_768x_buffer = await imageminService(buffer, { width: 768 })
    const thumbnail_mime_type = 'image/avif'
    thumbnail_768x_image = await upload_to_bucket({
      buffer: thumbnail_768x_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: `images/${category}/768x`,
      isPublic,
      category,
    })
    // 生成压缩图
    const compressed_buffer = await imageminService(buffer)
    compressed_image = await upload_to_bucket({
      buffer: compressed_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: `images/${category}/compressed`,
      isPublic,
      category,
    })

    // 解析 exif 和 address
    let exif = null
    let address = ''
    try {
      exif = await exifr.parse(buffer)
      address = await getAddressFromExif(exif)
    }
    catch (e) {
      console.error('getAddressFromExif error (async)', e)
    }
    // 更新数据库
    await db.image.update({
      where: { id: imageId },
      data: {
        thumbnail_768x: { connect: pick(thumbnail_768x_image, 'id') },
        compressed: { connect: pick(compressed_image, 'id') },
        exif,
        address,
      },
    })
  }
  catch (e) {
    console.error('handleImagePostProcess error', e)
    // 失败回滚，删除已上传的文件
    const files = [thumbnail_768x_image, compressed_image]
    for (const file of files) {
      if (file) {
        await delete_from_bucket(file)
      }
    }
  }
}

export async function uploadVideo(
  options: {
    file: File
    uploadedBy: string
    isPublic?: boolean
    category?: string
  },
) {
  const { file, isPublic = false, uploadedBy, category = 'default' } = options
  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  let duration = 0

  try {
    // 获取视频信息
    const videoInfo = await getVideoDuration(buffer)
    duration = videoInfo.duration
  }
  catch (e) {
    console.error('getVideoDuration error', e)
  }

  let video_file: FileWithBucket | null = null

  try {
    // 上传视频
    video_file = await upload_to_bucket({
      buffer,
      name,
      type,
      uploadedBy,
      bucketName: 'uploads',
      path_prefix: `videos/${category}`,
      isPublic,
      category,
    })

    const hash = (await sha256(buffer))!
    const size = file.size

    // 创建视频记录
    const video = await db.video.create({
      data: {
        name,
        type,
        size,
        duration,
        hash,
        file: {
          connect: pick(video_file, 'id'),
        },
        uploadedByUser: {
          connect: { id: uploadedBy },
        },
        isPublic,
        category,
      },
      include: videoInclude,
    })

    return transformVideoToResponse(video)
  }
  catch (e) {
    console.error(e)
    // 失败回滚，删除已上传的文件
    if (video_file) {
      await delete_from_bucket(video_file)
    }
    throw e
  }
}

export async function uploadFile(input: UploadFileInput) {
  const { file, uploadedBy, isPublic = false, category } = input
  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  const hash = (await sha256(buffer))!

  // 上传文件
  const fileObj = await upload_to_bucket({
    buffer,
    name,
    type,
    uploadedBy,
    bucketName: 'uploads',
    path_prefix: `files/${category}`,
    isPublic,
    category,
  })

  // 创建文件记录
  const fileRecord = await db.file.findFirst({
    where: {
      hash,
    },
  })

  if (fileRecord) {
    return {
      id: fileRecord.id,
      name: fileRecord.name,
      type: fileRecord.type,
      size: fileRecord.size,
      hash: fileRecord.hash,
      url: getFileUrl(fileObj),
    }
  }
}
