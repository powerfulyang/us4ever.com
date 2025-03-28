import type { FileWithBucket } from '@/service/file.service'
import type { Prisma } from '@prisma/client'
import { Buffer } from 'node:buffer'
import { db } from '@/server/db'
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sha1, sha256 } from 'hono/utils/crypto'

interface Options {
  buffer: ArrayBuffer
  name: string
  type: string
  uploadedBy: string
  bucketName: string
  path_prefix?: string
  isPublic?: boolean
  category: string
}

export async function upload_to_bucket(options: Options) {
  const {
    buffer,
    name,
    type,
    uploadedBy,
    bucketName,
    isPublic = false,
    path_prefix,
    category,
  } = options
  const size = buffer.byteLength
  const file_sha256 = (await sha256(buffer))!
  const file_sha1 = (await sha1(buffer))!
  const path = path_prefix ? `${path_prefix}/${file_sha256}` : file_sha256

  // 首先创建数据库记录
  const file = await db.file.create({
    data: {
      bucket: { connect: { name: bucketName } },
      uploadedByUser: { connect: { id: uploadedBy } },
      name,
      type,
      size,
      hash: file_sha256,
      path,
      isPublic,
      category,
      extraData: {
        sha1: file_sha1,
      },
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
      path: file.path,
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

// 获取所有的 Objects
export async function list_all_objects(bucketName: string, maxObjects?: number) {
  const bucket = await db.bucket.findUnique({
    where: {
      name: bucketName,
    },
  })
  if (!bucket) {
    throw new Error('Bucket not found')
  }
  const s3_client = get_s3_client(bucket)
  const objects: { Key: string, Size: number, LastModified: Date }[] = []
  let continuationToken: string | undefined

  // 数量可能超过单次查询的限制，需要使用 continuationToken 来分页查询
  while (true) {
    // 每次查询 1000 个对象
    const response = await s3_client.send(new ListObjectsV2Command({
      Bucket: bucket.bucketName,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    }))

    if (response.Contents) {
      objects.push(...response.Contents.map(obj => ({
        Key: obj.Key!,
        Size: obj.Size!,
        LastModified: obj.LastModified!,
      })))
    }

    // 如果设置了最大返回数量且已达到限制，则停止查询
    if (maxObjects && objects.length >= maxObjects) {
      objects.length = maxObjects
      break
    }

    // 如果没有更多数据，则停止查询
    if (!response.IsTruncated) {
      break
    }

    continuationToken = response.NextContinuationToken
  }

  return objects
}

export async function delete_object(bucketName: string, objectKey: string) {
  const bucket = await db.bucket.findUnique({
    where: {
      name: bucketName,
    },
  })
  if (!bucket) {
    throw new Error('Bucket not found')
  }
  const s3_client = get_s3_client(bucket)
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: bucket.bucketName,
    Key: objectKey,
  })
  const result = await s3_client.send(deleteObjectCommand)
  return result.$metadata.httpStatusCode === 204
}
