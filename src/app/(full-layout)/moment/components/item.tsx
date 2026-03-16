'use client'

import type { Image as ImageResponse } from '@/server/api/routers/asset'
import type { Moment } from '@/server/api/routers/moment'
import { motion } from 'framer-motion'
import { Globe, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { AssetImageWithData } from '@/app/(full-layout)/image/components/image'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { UserInfo } from '@/components/ui/user-info'
import { api } from '@/trpc/react'

interface MomentItemProps {
  moment: Moment
}

export function MomentItem({ moment }: MomentItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const previewOpenedRef = useRef(false)
  const utils = api.useUtils()

  const { mutate: deleteMoment, isPending } = api.moment.delete.useMutation({
    onSuccess: () => {
      setShowConfirm(false)
      return utils.moment.fetchByCursor.invalidate()
    },
  })

  // 处理预览状态变化
  const handleVisibleChange = useCallback((visible: boolean) => {
    setIsPreviewOpen(visible)

    if (visible) {
      // 预览打开时，添加历史记录状态
      if (!previewOpenedRef.current) {
        previewOpenedRef.current = true
        history.pushState({ photoPreview: true }, '', location.href)
      }
    }
    else {
      // 预览关闭时，如果是通过其他方式关闭（非返回键），需要清理历史记录
      if (previewOpenedRef.current && history.state?.photoPreview) {
        previewOpenedRef.current = false
        history.back()
      }
      else {
        previewOpenedRef.current = false
      }
    }
  }, [])

  // 监听浏览器返回事件
  useEffect(() => {
    const handlePopState = () => {
      if (isPreviewOpen) {
        // 如果预览是打开的，关闭它
        setIsPreviewOpen(false)
        previewOpenedRef.current = false
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isPreviewOpen])

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowConfirm(true)
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
            <UserInfo
              user={moment.owner}
              createdAt={moment.createdAt}
              rightArea={(
                <Badge
                  variant={moment.isPublic ? 'success' : 'warning'}
                  className="text-[10px] h-5 px-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider"
                >
                  {moment.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {moment.isPublic ? '公开' : '私密'}
                </Badge>
              )}
            />

            {/* 内容 */}
            {moment.content && (
              <MdRender className="text-sm text-foreground/90">
                {moment.content}
              </MdRender>
            )}

            {/* 图片/视频 */}
            {!!(moment.images.length || moment.videos.length) && (
              <PhotoProvider maskOpacity={0.8} onVisibleChange={handleVisibleChange}>
                <div className="flex flex-col gap-2" onClick={stopPropagation}>
                  {moment.images.length === 1 && moment.images[0] && (
                    <PhotoView src={moment.images[0].original_url}>
                      <div className="rounded-md overflow-hidden cursor-pointer">
                        <AssetImageWithData
                          image={moment.images[0] as ImageResponse}
                          className="object-contain"
                          showCompressed
                        />
                      </div>
                    </PhotoView>
                  )}

                  {moment.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-1 rounded-md overflow-hidden">
                      {moment.images.map(image => (
                        <PhotoView key={image.id} src={image.original_url}>
                          <div
                            className="aspect-square overflow-hidden bg-secondary cursor-pointer"
                          >
                            <AssetImageWithData
                              image={image}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </PhotoView>
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
              </PhotoProvider>
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
