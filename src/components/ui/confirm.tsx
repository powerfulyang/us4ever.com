'use client'

import { Button } from './button'
import { Modal } from './modal'

interface ConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  content?: string
  isConfirmLoading?: false | true
}

export function Confirm({
  isOpen,
  onClose,
  onConfirm,
  title = '确认',
  content = '确定要执行此操作吗？',
  isConfirmLoading,
}: ConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-6">
        <p className="text-gray-300">{content}</p>
        <div className="flex justify-end gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            isLoading={isConfirmLoading}
            onClick={onConfirm}
          >
            确定
          </Button>
        </div>
      </div>
    </Modal>
  )
}
