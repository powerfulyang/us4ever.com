'use client'

import type { Image, Video } from '@/server/api/routers/asset'
import type { Moment } from '@/server/api/routers/moment'
import { Upload } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
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
  initialMoment?: Moment
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function MomentCreate({ category, initialMoment, onSuccess, onCancel, className }: Props) {
  const [isPublic, setIsPublic] = useState(initialMoment?.isPublic ?? false)
  const [content, setContent] = useState(initialMoment?.content ?? '')
  const [selectedMedias, setSelectedMedias] = useState<Media[]>(() => {
    if (!initialMoment)
      return []
    const combined: Media[] = [
      ...initialMoment.images as Image[],
      ...initialMoment.videos as Video[],
    ]
    return combined
  })
  const [isUploading, setIsUploading] = useState(false)
  const utils = api.useUtils()

  const isEditing = !!initialMoment

  const { mutate: createMoment, isPending: isCreatePending } = api.moment.create.useMutation({
    onSuccess: () => {
      setContent('')
      setSelectedMedias([])
      void utils.moment.fetchByCursor.invalidate()
      onSuccess?.()
    },
  })

  const { mutate: updateMoment, isPending: isUpdatePending } = api.moment.update.useMutation({
    onSuccess: () => {
      void utils.moment.fetchByCursor.invalidate()
      onSuccess?.()
    },
  })

  const isPending = isCreatePending || isUpdatePending

  const handleSubmit = () => {
    if ((!content.trim() && selectedMedias.length === 0) || isUploading)
      return

    // 分离图片和视频 ID
    const imageIds = selectedMedias.filter(media => !isVideo(media)).map(media => media.id)
    const videoIds = selectedMedias.filter(isVideo).map(media => media.id)

    if (isEditing && initialMoment) {
      updateMoment({
        id: initialMoment.id,
        content: content.trim(),
        imageIds,
        videoIds,
        category: initialMoment.category ?? '',
      })
    }
    else {
      createMoment({
        content: content.trim(),
        imageIds,
        videoIds,
        isPublic,
        category,
      })
    }
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

  const contentElement = (
    <div className="space-y-4">
      <TextareaAutosize
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="分享此刻的想法..."
        className="w-full bg-transparent border-none focus:outline-none resize-none text-foreground placeholder:text-muted-foreground caret-primary"
        minRows={3}
        autoFocus={isEditing}
      />

      <MediaUpload
        category={category}
        medias={selectedMedias}
        onMediaSelectAction={handleMediaSelect}
        onMediaRemoveAction={handleMediaRemove}
        onUploadingChange={setIsUploading}
      />

      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            取消
          </Button>
        )}
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
        {!isEditing && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{isPublic ? '公开' : '私密'}</span>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
            />
          </div>
        )}
        <AuthenticatedOnly disableChildren>
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && selectedMedias.length === 0) || isPending || isUploading}
            isLoading={isPending}
          >
            {isEditing ? '更新' : '发布'}
          </Button>
        </AuthenticatedOnly>
      </div>
    </div>
  )

  if (isEditing) {
    return (
      <div className={cn('p-4', className)}>
        {contentElement}
      </div>
    )
  }

  return (
    <Card className={cn('p-4 mx-auto', className)}>
      {contentElement}
    </Card>
  )
}
