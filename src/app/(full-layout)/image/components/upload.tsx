'use client'

import type { UploadAreaRef } from '@/app/(full-layout)/image/components/upload-area'
import { Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { UploadArea } from '@/app/(full-layout)/image/components/upload-area'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'

interface ImageUploadProps {
  category?: string
}

export function ImageUpload({ category }: ImageUploadProps) {
  const utils = api.useUtils()
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File>()
  const uploadRef = useRef<UploadAreaRef>(null)

  const uploadMutation = api.asset.uploadImage.useMutation({
    onSuccess: () => {
      uploadRef.current?.reset()
      return utils.asset.fetchImagesByCursor.invalidate()
    },
  })

  const handleUpload = () => {
    if (!selectedFile)
      return
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('isPublic', isPublic.toString())
    if (category) {
      formData.append('category', category)
    }
    uploadMutation.mutate(formData)
  }

  return (
    <div className="max-w-3xl m-auto">
      <div className="flex flex-col max-w-3xl gap-2 mb-4">
        <UploadArea
          ref={uploadRef}
          onFileSelect={setSelectedFile}
          disabled={uploadMutation.isPending}
        />
        <div className="flex justify-end items-center gap-4">
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={uploadMutation.isPending}
          />
          <AuthenticatedOnly disableChildren>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${uploadMutation.isPending || !selectedFile ? 'bg-gray-500/50 cursor-not-allowed text-gray-300' : 'bg-gradient-to-br from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 active:from-emerald-600 active:to-cyan-600 cursor-pointer text-white shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0'} before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity relative overflow-hidden`}
            >
              <span className="relative flex items-center gap-2">
                {uploadMutation.isPending
                  ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>上传中...</span>
                      </>
                    )
                  : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>确认上传</span>
                      </>
                    )}
              </span>
            </button>
          </AuthenticatedOnly>
        </div>
      </div>
    </div>
  )
}
