'use client'

import type { Keep } from '@prisma/client'
import { ArrowLeft, Eye, Image } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Back } from '@/app/(full-layout)/keep/components/back'
import MdEditor from '@/components/md-editor'
import { Markdown } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'

interface KeepEditorProps {
  keep?: Keep | null
}

export default function KeepEditor({ keep }: KeepEditorProps) {
  const id = keep?.id
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorHasFocus, setEditorHasFocus] = useState(false)

  const router = useRouter()
  const [content, setContent] = useState(() => {
    return keep?.content ?? ''
  })
  const [isPublic, setIsPublic] = useState(() => {
    return keep?.isPublic ?? false
  })

  const { mutate: createMutate, isPending: isCreatePending } = api.keep.create.useMutation({
    onSuccess: (data) => {
      router.replace(`/keep/${data.id}`)
    },
  })
  const { mutate: updateMutate, isPending: isUpdatePending } = api.keep.update.useMutation({
    onSuccess: (data) => {
      router.replace(`/keep/${data.id}`)
    },
  })

  const { mutate: uploadImage, isPending: isUploading } = api.asset.uploadImage.useMutation({
    onSuccess: (data) => {
      // 在光标位置插入图片 Markdown
      const markdownImage = `\n![${data.id || ''}](${data.original_url})\n`
      setContent(prev => prev + markdownImage)
    },
    onError: (error) => {
      console.error('图片上传失败:', error)
    },
  })

  const isPending = isCreatePending || isUpdatePending

  // 处理图片粘贴
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!editorHasFocus)
      return
    const items = e.clipboardData?.items
    if (!items)
      return

    let hasImage = false
    let imageFile: File | null = null
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.includes('image')) {
        hasImage = true
        imageFile = item.getAsFile()
        break
      }
    }
    if (hasImage && imageFile) {
      e.preventDefault()
      e.stopPropagation()
      try {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('category', 'keep')
        uploadImage(formData)
      }
      catch (error) {
        console.error('处理粘贴图片失败:', error)
      }
    }
  }, [uploadImage, editorHasFocus])

  // 监听粘贴事件
  React.useEffect(() => {
    if (typeof window === 'undefined')
      return

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  function handleSave() {
    if (!content)
      return

    if (id) {
      updateMutate({
        id,
        content,
        isPublic,
      })
    }
    else {
      createMutate({
        content,
        isPublic,
      })
    }
  }

  return (
    <div>
      <Back
        fallback="/keep"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-3 ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回笔记列表</span>
      </Back>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">
              {id ? '编辑笔记' : '创建新笔记'}
            </h1>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span>上传图片中...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isPending || !content}
              isLoading={isPending}
              className="gap-1"
            >
              {isPending ? '保存中...' : '保存笔记'}
            </Button>
          </div>
        </div>

        <div className="h-[55vh] grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 编辑器 */}
          <div
            ref={editorRef}
            className="relative rounded-none overflow-hidden border-none bg-card/50 backdrop-blur-sm"
            onFocus={() => setEditorHasFocus(true)}
            onBlur={() => setEditorHasFocus(false)}
          >
            <MdEditor
              value={content}
              onChange={v => setContent(v)}
              placeholder="开始输入内容..."
            />
            {/* 功能提示 */}
            {editorHasFocus && !isUploading && (
              <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-2 rounded-none border-none shadow-lg flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                <span>Ctrl+V 粘贴图片</span>
              </div>
            )}
          </div>

          {/* 预览 */}
          <div className="rounded-none overflow-hidden border-none bg-card/50 backdrop-blur-sm flex flex-col">
            <div className="sticky top-0 z-10 bg-secondary/50 backdrop-blur-sm px-4 py-2 border-b border-none">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                预览
              </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <Markdown>
                {content || '*开始输入内容，这里会实时显示预览...*'}
              </Markdown>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
