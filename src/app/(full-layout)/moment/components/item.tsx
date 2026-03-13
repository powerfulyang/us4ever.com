'use client'

import type { Image as ImageResponse } from '@/server/api/routers/asset'
import type { Moment } from '@/server/api/routers/moment'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { AssetImageWithData } from '@/app/(full-layout)/image/components/image'
import { ImagePreviewModal } from '@/app/(full-layout)/image/components/preview-modal'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { api } from '@/trpc/react'

interface MomentItemProps {
  moment: Moment
}

export function MomentItem({ moment }: MomentItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const utils = api.useUtils()

  const { mutate: deleteMoment, isPending } = api.moment.delete.useMutation({
    onSuccess: () => {
      setShowConfirm(false)
      return utils.moment.fetchByCursor.invalidate()
    },
  })

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handlePreview(index: number) {
    setIsPreviewOpen(true)
    setPreviewIndex(index)
  }

  const showDelete = moment.category !== 'eleven'
  const router = useRouter()

  function gotoDetail() {
    router.push(`/moment/${moment.id}`)
  }

  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={gotoDetail}
        className="cursor-pointer"
      >
        <Card hoverable className="p-4">
          <div className="space-y-3">
            {/* 头部：用户信息 */}
            <div className="flex items-center gap-3">
              <img
                src={moment.owner.avatar}
                alt={moment.owner.nickname}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {moment.owner.nickname}
                </h3>
                <time className="text-xs text-muted-foreground">
                  {dayjs(moment.createdAt).format('YYYY-MM-DD HH:mm')}
                </time>
              </div>
              <Badge variant={moment.isPublic ? 'success' : 'secondary'} className="text-xs">
                {moment.isPublic ? '公开' : '私密'}
              </Badge>
            </div>

            {/* 内容 */}
            {moment.content && (
              <MdRender className="text-sm text-foreground/90">
                {moment.content}
              </MdRender>
            )}

            {/* 图片/视频 */}
            {!!(moment.images.length || moment.videos.length) && (
              <div className="flex flex-col gap-2" onClick={stopPropagation}>
                {moment.images.length === 1 && (
                  <div onClick={() => handlePreview(0)} className="rounded-md overflow-hidden">
                    <AssetImageWithData
                      image={moment.images[0] as ImageResponse}
                      className="object-contain"
                      showCompressed
                    />
                  </div>
                )}

                {moment.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-1 rounded-md overflow-hidden">
                    {moment.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="aspect-square overflow-hidden bg-secondary"
                        onClick={() => handlePreview(index)}
                      >
                        <AssetImageWithData
                          image={image}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {moment.videos.length === 1 && (
                  <div className="rounded-md aspect-[9/16] overflow-hidden bg-secondary">
                    <video
                      src={moment.videos[0]?.file_url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {moment.videos.length > 1 && (
                  <div className="grid grid-cols-3 gap-1 rounded-md overflow-hidden">
                    {moment.videos.map(video => (
                      <div
                        key={video.id}
                        className="aspect-square overflow-hidden bg-secondary"
                      >
                        <video
                          src={video.file_url}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="pt-1">
              <Divider className="mb-3" />
              <ItemActions
                views={moment.views}
                likes={moment.likes}
                ownerId={moment.ownerId}
                onDelete={showDelete ? handleDelete : undefined}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 图片预览 */}
      <ImagePreviewModal
        images={moment.images.map((image) => {
          return {
            src: image.compressed_url,
            placeholder: image.thumbnail_320x_url,
            width: image.width,
            height: image.height,
          }
        })}
        currentIndex={previewIndex}
        onCurrentIndexChange={setPreviewIndex}
        isOpen={isPreviewOpen}
        onCloseAction={() => setIsPreviewOpen(false)}
      />

      {/* 删除确认 */}
      <Confirm
        isOpen={showConfirm}
        onCloseAction={() => setShowConfirm(false)}
        onConfirmAction={() => deleteMoment({ id: moment.id })}
        isConfirmLoading={isPending}
        title="删除动态"
        content="确定要删除这条动态吗？此操作不可逆"
      />
    </>
  )
}
