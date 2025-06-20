import { assetService } from '@/service/asset.service'
import { uploadFile as uploadFileService, uploadVideo } from '@/service/file.service'

export interface UploadFileInput {
  file: File
  uploadedBy: string
  isPublic?: boolean
  category: string
}
export async function uploadFile(input: UploadFileInput) {
  const { file, uploadedBy, isPublic = false, category } = input
  const mimeType = file.type
  if (mimeType.startsWith('video')) {
    return await uploadVideo({
      file,
      uploadedBy,
      isPublic,
      category,
    })
  }
  else if (mimeType.startsWith('image')) {
    return await assetService.uploadImage({
      file,
      uploadedBy,
      isPublic,
      category,
    })
  }
  else {
    return await uploadFileService({
      file,
      uploadedBy,
      isPublic,
      category,
    })
  }
}
