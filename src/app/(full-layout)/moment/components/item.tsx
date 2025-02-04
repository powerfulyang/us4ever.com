'use client'

import type { Moment } from '@/server/api/routers/moment'
import { AssetImageWithData } from '@/components/image/image'
import { MdRender } from '@/components/md-render'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { api } from '@/trpc/react'
import { cn } from '@/utils'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import React, { useState } from 'react'

interface MomentItemProps {
  moment: Moment
}

export function MomentItem({ moment }: MomentItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()

  const { mutate: deleteMoment, isPending } = api.moment.delete.useMutation({
    onSuccess: () => {
      setShowConfirm(false)
      return utils.moment.list.invalidate()
    },
  })

  function handleDelete() {
    setShowConfirm(true)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="用户头像"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col justify-center gap-1">
                <h3 className="text-sm text-gray-200">eleven</h3>
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
              <MdRender>
                {moment.content}
              </MdRender>
            )}

            {moment.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {moment.images.map(image => (
                  <div
                    key={image.id}
                    className="relative pt-[100%] rounded-lg overflow-hidden bg-white/5"
                  >
                    <AssetImageWithData
                      image={image}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto">
              <Divider className="mb-3 mt-1" />
              <ItemActions
                views={moment.views}
                likes={moment.likes}
                ownerId={moment.ownerId}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteMoment({ id: moment.id })}
        isConfirmLoading={isPending}
        title="删除动态"
        content="确定要删除这条动态吗？此操作不可逆"
      />
    </>
  )
}
