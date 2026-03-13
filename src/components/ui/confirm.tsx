'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmProps {
  isOpen: boolean
  onCloseAction: () => void
  onConfirmAction: () => Promise<void> | void
  title?: string
  content?: string
  isConfirmLoading?: boolean
}

export function Confirm({
  isOpen,
  onCloseAction,
  onConfirmAction,
  title = '确认',
  content = '确定要执行此操作吗？',
  isConfirmLoading,
}: ConfirmProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && onCloseAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmAction}
            disabled={isConfirmLoading}
          >
            {isConfirmLoading ? '处理中...' : '确定'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
