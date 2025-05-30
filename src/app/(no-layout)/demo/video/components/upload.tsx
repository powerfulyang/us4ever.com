'use client'
import React from 'react'
import { api } from '@/trpc/react'

export function VideoUpload() {
  const utils = api.useUtils()
  const { mutate, isPending } = api.asset.upload_video.useMutation({
    onSuccess() {
      return utils.asset.infinite_video_list.invalidate()
    },
  })

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files)
      return
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'demo')
      mutate(formData)
    }
  }

  return (
    <div className="flex gap-2 items-center pt-4">
      <input accept={'video/*'} type="file" onChange={handleFileChange} />
      {isPending && <span>上传中...</span>}
    </div>
  )
}
