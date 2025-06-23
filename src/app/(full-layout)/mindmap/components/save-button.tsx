'use client'

import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'

interface SaveButtonProps {
  id: string
  isPublic: boolean
  title: string
  content: Record<string, any>
  disabled?: boolean
}

export function SaveButton({ id, isPublic, title, content, disabled }: SaveButtonProps) {
  const utils = api.useUtils()

  const { mutate: updateMindMap, isPending: isSaving } = api.mindMap.update.useMutation({
    onSuccess: () => {
      toast.success('思维导图已保存')
      return utils.mindMap.getById.invalidate({ id })
    },
    onError: (error) => {
      toast.error(`保存失败: ${error.message}`)
    },
  })

  const handleSave = async () => {
    updateMindMap({
      id,
      content,
      title,
      isPublic,
    })
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || disabled}
      className={disabled ? 'opacity-50 transition-opacity' : 'opacity-100 transition-opacity'}
    >
      {isSaving ? '保存中...' : '保存'}
    </Button>
  )
}
