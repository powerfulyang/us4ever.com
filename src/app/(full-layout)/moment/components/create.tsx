'use client'

import type { Image, Video } from '@/server/api/routers/asset'
import { Upload } from 'lucide-react'
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
            <Upload width="20" height="20" />
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
