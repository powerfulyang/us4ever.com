import type { AmapRegeoCode } from '@/types/amap'
import type { Prisma } from '@prisma/client'
import { Buffer } from 'node:buffer'
import { env } from '@/env'
import { db } from '@/server/db'
import { imageminService } from '@/service/imagemin.service'
import { delete_from_bucket, upload_to_bucket } from '@/service/s3.service'
import { formatBearing } from '@/utils'
import { wgs84togcj02 } from 'coordtransform'
import exifr from 'exifr'
import { pick } from 'lodash-es'
import sharp from 'sharp'

export type FileWithBucket = Prisma.FileGetPayload<{
  include: {
    bucket: true
  }
}>

export function getFileUrl(file: FileWithBucket) {
  const publicUrl = file.bucket.publicUrl
  return `${publicUrl}/${file.path}`
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
  let address = ''
  if (GPSLatitude && GPSLongitude) {
    const [gcj02Longitude, gcj02Latitude] = wgs84togcj02(formatBearing(GPSLongitude), formatBearing(GPSLatitude))
    const location = `${gcj02Longitude},${gcj02Latitude}`
    const res = await regeo(location)
    address = res.formatted_address
  }
  return address
}

export async function upload_image(
  options: {
    file: File
    uploadedBy: string
    isPublic?: boolean
  },
) {
  const { file, isPublic = false, uploadedBy } = options
  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  const metadata = await sharp(buffer).metadata()
  const { width, height } = metadata
  let address = ''
  let exif = null
  try {
    exif = await exifr.parse(buffer)
    address = await getAddressFromExif(exif)
  }
  catch (e) {
    console.error(e)
    // ignore error
  }

  let original_image: FileWithBucket | null = null
  let thumbnail_320x_image: FileWithBucket | null = null
  let thumbnail_768x_image: FileWithBucket | null = null
  let compressed_image: FileWithBucket | null = null

  try {
    // 上传原图
    original_image = await upload_to_bucket({
      buffer,
      name,
      type,
      uploadedBy,
      bucketName: 'uploads',
      isPublic,
    })

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
      path_prefix: '320x',
      isPublic,
    })

    // 生成 768x 的缩略图
    const thumbnail_768x_buffer = await imageminService(buffer, {
      width: 768,
    })
    thumbnail_768x_image = await upload_to_bucket({
      buffer: thumbnail_768x_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: '768x',
      isPublic,
    })

    // 生成压缩图
    const compressed_buffer = await imageminService(buffer)
    compressed_image = await upload_to_bucket({
      buffer: compressed_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: 'compressed',
      isPublic,
    })

    // 创建图片记录
    return await db.image.create({
      data: {
        name: original_image.name,
        type: original_image.type,
        size: original_image.size,
        width: width || 0,
        height: height || 0,
        hash: original_image.hash,
        address,
        exif,
        // 10x 模糊预览图
        thumbnail_10x: Buffer.from(thumbnail_10x_buffer),
        // 320x 缩略图
        thumbnail_320x: {
          connect: pick(thumbnail_320x_image, 'id'),
        },
        // 768x 缩略图
        thumbnail_768x: {
          connect: pick(thumbnail_768x_image, 'id'),
        },
        // 压缩图
        compressed: {
          connect: pick(compressed_image, 'id'),
        },
        // 原图
        original: {
          connect: pick(original_image, 'id'),
        },
        isPublic,
        uploadedBy,
      },
    })
  }
  catch (e) {
    console.error(e)
    // 失败回滚，删除已上传的文件
    const images = [original_image, thumbnail_320x_image, thumbnail_768x_image, compressed_image]
    for (const image of images) {
      if (image) {
        await delete_from_bucket(image)
      }
    }
    throw e
  }
}
