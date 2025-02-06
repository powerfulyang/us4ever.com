'use client'

import type { Image } from '@/server/api/routers/asset'
import { Modal } from '@/components/ui/modal'
import { formatFileSize } from '@/utils'

interface ImageInfoModalProps {
  image: Image
  isOpen: boolean
  onCloseAction: () => void
}

export function ImageInfoModal({ image, isOpen, onCloseAction }: ImageInfoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title="图片信息"
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">基本信息</h4>
          <div className="grid grid-cols-2 gap-4 break-all">
            <div>
              <div className="text-sm text-gray-400">文件名</div>
              <div className="text-white font-medium">{image.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">文件大小</div>
              <div className="text-white font-medium">{formatFileSize(image.original_size)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">压缩后大小</div>
              <div className="text-white font-medium">{formatFileSize(image.compressed_size)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">压缩率</div>
              <div className="text-white font-medium">
                {Math.round((1 - Number(image.compressed_size) / Number(image.original_size)) * 100)}
                %
              </div>
            </div>
          </div>
        </div>

        {image.exif && !!Object.keys(image.exif).length && (
          <>
            <div className="w-full h-px bg-white/10" />
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">EXIF 信息</h4>
              <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-auto">
                {Object.entries(image.exif)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([key, value]) => (
                    <div key={key} className="break-all">
                      <div className="text-sm text-gray-400">{key}</div>
                      <div className="text-white font-medium">
                        {String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {image.address && (
          <>
            <div className="w-full h-px bg-white/10" />
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">地址信息</h4>
              <div className="text-white font-medium">
                {image.address}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
