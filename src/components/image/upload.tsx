'use client'

import type { ChangeEvent } from 'react'
import { api } from '@/trpc/react'
import Image from 'next/image'
import { useState } from 'react'

export function ImageUpload() {
  const utils = api.useUtils()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const uploadMutation = api.asset.upload_image.useMutation({
    onSuccess: () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      setPreview(null)
      setSelectedFile(null)
      return utils.asset.list_image.invalidate()
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    // revoke previous preview url
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(URL.createObjectURL(file))
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile)
      return
    const formData = new FormData()
    formData.append('file', selectedFile)
    await uploadMutation.mutateAsync(formData)
  }

  return (
    <div className="mb-8">
      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-xl p-4 border border-white/20">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadMutation.isPending} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${uploadMutation.isPending ? 'bg-gray-500/50 cursor-not-allowed text-gray-300' : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 cursor-pointer text-white shadow-lg hover:shadow-xl'}`}>
              {uploadMutation.isPending ? '上传中...' : '选择图片'}
            </label>
            <button type="button" onClick={handleUpload} disabled={uploadMutation.isPending} className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${uploadMutation.isPending ? 'bg-gray-500/50 cursor-not-allowed text-gray-300' : 'bg-gradient-to-br from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 active:from-emerald-600 active:to-cyan-600 cursor-pointer text-white shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0'} before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity relative overflow-hidden`}>
              <span className="relative flex items-center gap-2">
                {uploadMutation.isPending
                  ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>上传中...</span>
                      </>
                    )
                  : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>确认上传</span>
                      </>
                    )}
              </span>
            </button>
          </div>
          {preview && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg border border-white/20">
              <Image src={preview} alt="Preview" fill className="object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
