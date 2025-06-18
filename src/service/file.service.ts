import type { Prisma } from '@prisma/client'
import type { UploadFileInput } from './upload.service'
import type { AmapRegeoCode } from '@/types/amap'
import { Buffer } from 'node:buffer'
import { wgs84togcj02 } from 'coordtransform'
import exifr from 'exifr'
import { sha256 } from 'hono/utils/crypto'
import { pick } from 'lodash-es'
import sharp from 'sharp'
import { env } from '@/env'
import { getVideoDuration } from '@/lib/ffmpeg'
import { db } from '@/server/db'
import { imageInclude, transformImageToResponse, transformVideoToResponse, videoInclude } from '@/service/asset.service'
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

export async function upload_image(
  options: {
    file: File
    uploadedBy: string
    isPublic?: boolean
    category: string
  },
) {
  const { file, isPublic = false, uploadedBy, category } = options
  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  let width = 0
  let height = 0
  try {
    const metadata = await sharp(buffer).metadata()
    width = metadata.width || 0
    height = metadata.height || 0
  }
  catch (e) {
    console.error('sharp metadata error', e)
  }

  let thumbnail_320x_image: FileWithBucket | null = null

  try {
    const thumbnail_mime_type = 'image/avif'

    // 生成 10x 的模糊预览图
    const thumbnail_10x_buffer = await imageminService(buffer, {
      width: 10,
    })

    // 生成 320x 的缩略图
    const thumbnail_320x_buffer = await imageminService(buffer, {
      width: 320,
    })
    thumbnail_320x_image = await upload_to_bucket({
      buffer: thumbnail_320x_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: `images/${category}/320x`,
      isPublic,
      category,
    })

    const hash = (await sha256(buffer))!
    const size = file.size

    // 创建图片记录（部分字段为 null，异步后补）
    const image = await db.image.create({
      data: {
        name,
        type,
        size,
        width,
        height,
        hash,
        address: '', // 后补
        exif: {}, // 后补
        thumbnail_10x: Buffer.from(thumbnail_10x_buffer), // 后补
        thumbnail_320x: {
          connect: pick(thumbnail_320x_image, 'id'),
        },
        uploadedByUser: {
          connect: { id: uploadedBy },
        },
        isPublic,
        category,
      },
      include: imageInclude,
    })

    process.nextTick(() => {
      // 异步处理其余图片任务
      void handleImagePostProcess({
        buffer,
        name,
        type,
        uploadedBy,
        isPublic,
        category,
        imageId: image.id,
      })
    })

    // 只返回主记录和 320x 缩略图
    return transformImageToResponse(image)
  }
  catch (e) {
    console.error(e)
    // 失败回滚，删除已上传的文件
    const images = [thumbnail_320x_image]
    for (const image of images) {
      if (image) {
        await delete_from_bucket(image)
      }
    }
    throw e
  }
}

// 新增：异步处理其余图片任务
async function handleImagePostProcess(options: {
  buffer: ArrayBuffer
  name: string
  type: string
  uploadedBy: string
  isPublic: boolean
  category: string
  imageId: string
}) {
  const { buffer, name, type, uploadedBy, isPublic, category, imageId } = options
  let thumbnail_768x_image: FileWithBucket | null = null
  let compressed_image: FileWithBucket | null = null
  let original_image: FileWithBucket | null = null
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
    // 上传原图
    original_image = await upload_to_bucket({
      buffer,
      name,
      type,
      uploadedBy,
      bucketName: 'uploads',
      isPublic,
      path_prefix: `images/${category}/original`,
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
        original: { connect: pick(original_image, 'id') },
        exif,
        address,
      },
    })
  }
  catch (e) {
    console.error('handleImagePostProcess error', e)
    // 失败回滚，删除已上传的文件
    const images = [thumbnail_768x_image, compressed_image, original_image]
    for (const image of images) {
      if (image) {
        await delete_from_bucket(image)
      }
    }
  }
}

export async function upload_video(options: {
  file: File
  uploadedBy: string
  isPublic?: boolean
  category: string
}) {
  const { file, uploadedBy, isPublic = false, category } = options
  const buffer = await file.arrayBuffer()
  const duration = await getVideoDuration(file)
  const name = file.name
  const type = file.type
  const uploadedFile = await upload_to_bucket({
    buffer,
    name,
    type,
    uploadedBy,
    bucketName: 'uploads',
    path_prefix: `videos/${category}/original`,
    isPublic,
    category,
  })

  const video = await db.video.create({
    data: {
      name: uploadedFile.name,
      type: uploadedFile.type,
      size: uploadedFile.size,
      hash: uploadedFile.hash,
      duration,
      uploadedByUser: {
        connect: { id: uploadedBy },
      },
      file: {
        connect: { id: uploadedFile.id },
      },
      isPublic,
      category,
    },
    include: videoInclude,
  })

  return transformVideoToResponse(video)
}

export async function upload_file(input: UploadFileInput) {
  const { file, uploadedBy, isPublic = false, category, fileCategory } = input
  const mimeType = file.type
  const c = fileCategory || mimeType.split('/')[0] || 'files'

  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  const uploadedFile = await upload_to_bucket({
    buffer,
    name,
    type,
    uploadedBy,
    bucketName: 'uploads',
    path_prefix: `${c}/${category}/original`,
    isPublic,
    category,
  })
  return uploadedFile
}
