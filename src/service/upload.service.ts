import { upload_file, upload_image, upload_video } from '@/service/file.service'

export interface UploadFileInput {
  file: File
  uploadedBy: string
  isPublic?: boolean
  category: string
  fileCategory?: string
}
export async function uploadFile(input: UploadFileInput) {
  const { file, uploadedBy, isPublic = false, category, fileCategory } = input
  const mimeType = file.type
  if (mimeType.startsWith('video')) {
    return await upload_video({
      file,
      uploadedBy,
      isPublic,
      category,
    })
  }
  else if (mimeType.startsWith('image')) {
    return await upload_image({
      file,
      uploadedBy,
      isPublic,
      category,
    })
  }
  else {
    return await upload_file({
      file,
      uploadedBy,
      isPublic,
      category,
      fileCategory,
    })
  }
}
