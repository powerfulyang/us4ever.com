'use client'

import type { Image, Video } from '@/server/api/routers/asset'
import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import { MediaUpload } from './image-upload'

// 媒体类型联合类型
type Media = Image | Video

// 判断是否为视频
function isVideo(media: Media): media is Video {
  return 'duration' in media
}

interface Props {
  category?: string
}

export function MomentCreate({ category }: Props) {
  const [isPublic, setIsPublic] = useState(false)
  const [content, setContent] = useState('')
  const [selectedMedias, setSelectedMedias] = useState<Media[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const utils = api.useUtils()

  const { mutate: createMoment, isPending } = api.moment.create.useMutation({
    onSuccess: () => {
      setContent('')
      setSelectedMedias([])
      return utils.moment.fetchByCursor.invalidate()
    },
  })

  const handleSubmit = () => {
    if ((!content.trim() && selectedMedias.length === 0) || isUploading)
      return

    // 分离图片和视频 ID
    const imageIds = selectedMedias.filter(media => !isVideo(media)).map(media => media.id)
    const videoIds = selectedMedias.filter(isVideo).map(media => media.id)

    createMoment({
      content: content.trim(),
      imageIds,
      videoIds,
      isPublic,
      category,
    })
  }

  const handleMediaSelect = (media: Media) => {
    setSelectedMedias(prev => [...prev, media])
  }

  const handleMediaRemove = (media: Media) => {
    setSelectedMedias(prev => prev.filter(item => item.id !== media.id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <Card className="space-y-4 mx-auto p-4">
      <TextareaAutosize
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="分享此刻的想法..."
        className="w-full bg-transparent border-none focus:outline-none resize-none text-white placeholder:text-gray-400"
        minRows={3}
      />

      <MediaUpload
        category={category}
        medias={selectedMedias}
        onMediaSelectAction={handleMediaSelect}
        onMediaRemoveAction={handleMediaRemove}
        onUploadingChange={setIsUploading}
      />

      <div className="flex items-center justify-end gap-4">
        <AuthenticatedOnly disableChildren>
          <Button
            variant="ghost"
            onClick={() => {
              const uploadInput = document.querySelector<HTMLInputElement>('input[type="file"]')
              uploadInput?.click()
            }}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 20q-.825 0-1.412-.587T4 18v-2q0-.425.288-.712T5 15t.713.288T6 16v2h12v-2q0-.425.288-.712T19 15t.713.288T20 16v2q0 .825-.587 1.413T18 20zm5-12.15L9.125 9.725q-.3.3-.712.288T7.7 9.7q-.275-.3-.288-.7t.288-.7l3.6-3.6q.15-.15.325-.212T12 4.425t.375.063t.325.212l3.6 3.6q.3.3.288.7t-.288.7q-.3.3-.712.313t-.713-.288L13 7.85V15q0 .425-.288.713T12 16t-.712-.288T11 15z" /></svg>
            上传
          </Button>
        </AuthenticatedOnly>
        <Switch
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={isPending}
        />
        <AuthenticatedOnly disableChildren>
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && selectedMedias.length === 0) || isPending || isUploading}
            isLoading={isPending}
          >
            发布
          </Button>
        </AuthenticatedOnly>
      </div>
    </Card>
  )
}
