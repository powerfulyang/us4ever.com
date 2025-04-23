'use client'

import type { Image as ImageResponse } from '@/server/api/routers/asset'
import type { Moment } from '@/server/api/routers/moment'
import { AssetImageWithData } from '@/app/(full-layout)/image/components/image'
import { ImagePreviewModal } from '@/app/(full-layout)/image/components/preview-modal'
import { MdRender } from '@/components/md-render'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { api } from '@/trpc/react'
import { cn } from '@/utils'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

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
      return utils.moment.infinite_list.invalidate()
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
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={moment.owner.avatar}
                alt={moment.owner.nickname}
                className="w-10 h-10 rounded-sm"
              />
              <div className="flex flex-col justify-center gap-1">
                <h3 className="text-sm text-gray-200">{moment.owner.nickname}</h3>
                <time className="text-xs text-gray-400">
                  {dayjs(moment.createdAt).format('YYYY年MM月DD日 HH:mm')}
                </time>
              </div>
              <button
                type="button"
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors ml-auto',
                  moment.isPublic ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30',
                )}
              >
                {moment.isPublic ? '公开' : '私密'}
              </button>
            </div>
            {moment.content && (
              <MdRender className="text-sm">
                {moment.content}
              </MdRender>
            )}

            <div className="flex flex-col gap-2" onClick={stopPropagation}>
              {moment.images.length === 1 && (
                <div onClick={() => handlePreview(0)}>
                  <AssetImageWithData
                    image={moment.images[0] as ImageResponse}
                    className="object-contain"
                    showCompressed
                  />
                </div>
              )}

              {moment.images.length > 1 && (
                <div className="grid grid-cols-3 gap-1">
                  {moment.images.map((image, index) => (
                    <div
                      key={image.id}
                      className="rounded aspect-square overflow-hidden bg-white/5"
                      onClick={() => handlePreview(index)}
                    >
                      <AssetImageWithData
                        image={image}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {moment.videos.length === 1 && (
                <div className="rounded aspect-[9/16] overflow-hidden bg-white/5">
                  <video
                    src={moment.videos[0]?.file_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {moment.videos.length > 1 && (
                <div className="grid grid-cols-3 gap-1">
                  {moment.videos.map(video => (
                    <div
                      key={video.id}
                      className="rounded aspect-square overflow-hidden bg-white/5"
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

            <div className="mt-auto">
              <Divider className="mb-3 mt-1" />
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
