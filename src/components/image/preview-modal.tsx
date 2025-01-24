'use client'

import { Modal } from '@/components/ui/modal'
import { cn } from '@/utils/cn'

interface ImagePreviewModalProps {
  src?: string
  alt?: string
  isOpen: boolean
  onClose: () => void
}

export function ImagePreviewModal({ src = '', alt = '预览图片', isOpen, onClose }: ImagePreviewModalProps) {
  if (!src)
    return null

  return (
    <Modal
      onCloseAction={onClose}
      isOpen={isOpen}
      className="h-[55vh] sm:h-[80vh] sm:w-[70vw]"
    >
      <div className="flex justify-center items-center w-full h-full pt-12 sm:px-6 sm:pb-6">
        <img
          src={src}
          alt={alt}
          className={cn(
            'object-cover',
            'transition-all duration-300',
            'cursor-zoom-out w-full h-full',
          )}
          onClick={onClose}
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </Modal>
  )
}
