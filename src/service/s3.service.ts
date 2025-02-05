import type { FileWithBucket } from '@/service/file.service'
import type { Prisma } from '@prisma/client'
import { Buffer } from 'node:buffer'
import { db } from '@/server/db'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sha256 } from 'hono/utils/crypto'

interface Options {
  buffer: ArrayBuffer
  name: string
  type: string
  uploadedBy: string
  bucketName: string
  path_prefix?: string
  isPublic?: boolean
}

export async function upload_to_bucket(options: Options) {
  const { buffer, name, type, uploadedBy, bucketName, isPublic = false, path_prefix } = options
  const size = buffer.byteLength
  const original_sha256 = (await sha256(buffer))!
  const path = path_prefix ? `${path_prefix}/${original_sha256}` : original_sha256

  // 首先创建数据库记录
  const file = await db.file.create({
    data: {
      bucket: { connect: { name: bucketName } },
      uploadedByUser: { connect: { id: uploadedBy } },
      name,
      type,
      size,
      hash: original_sha256,
      path,
      isPublic,
    },
    include: {
      bucket: true,
    },
  })

  const bucket = file.bucket

  const s3_client = get_s3_client(bucket)

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucket.bucketName,
    Key: file.path,
    ContentType: file.type,
    Body: Buffer.from(buffer),
    CacheControl: 'public, immutable, max-age=31536000',
  })

  try {
    // 如果上传成功，直接返回 file
    await s3_client.send(putObjectCommand)
    return file
  }
  catch (err) {
    // 如果上传失败，则回滚数据库中的记录
    await db.file.delete({ where: { id: file.id } })
    throw err
  }
}

export function get_s3_client(bucket: Prisma.BucketGetPayload<object>) {
  return new S3Client({
    region: bucket.region,
    endpoint: bucket.endpoint,
    credentials: {
      accessKeyId: bucket.accessKey,
      secretAccessKey: bucket.secretKey,
    },
  })
}

// 删除上传的文件
export async function delete_from_bucket(file: FileWithBucket) {
  // 判断数据库中是否有其他文件引用这个对象
  // 根据文件 hash 来判断
  const other = await db.file.findFirst({
    where: {
      hash: file.hash,
      id: { not: file.id },
    },
  })

  const s3_client = get_s3_client(file.bucket)
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: file.bucket.bucketName,
    Key: file.path,
  })
  // 如果数据库中没有其他文件引用这个对象，则删除文件
  if (!other) {
    await s3_client.send(deleteObjectCommand)
  }

  await db.file.delete({ where: { id: file.id } })
}
