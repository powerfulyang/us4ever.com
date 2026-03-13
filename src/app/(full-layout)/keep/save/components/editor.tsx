'use client'

import type { Keep } from '@prisma/client'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Save,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useState } from 'react'
import MdEditor from '@/components/mdx-editor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'

interface KeepEditorProps {
  keep?: Keep | null
}

export default function KeepEditor({ keep }: KeepEditorProps) {
  const id = keep?.id
  const router = useRouter()
  const [content, setContent] = useState(keep?.content ?? '')
  const [isPublic, setIsPublic] = useState(keep?.isPublic ?? false)
  const [isFocused, setIsFocused] = useState(false)

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
      const markdownImage = `\n![${data.id || ''}](${data.original_url})\n`
      setContent(prev => prev + markdownImage)
    },
  })

  const isPending = isCreatePending || isUpdatePending

  // 处理图片粘贴
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!isFocused)
      return
    const items = e.clipboardData?.items
    if (!items)
      return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item?.type.includes('image')) {
        const imageFile = item.getAsFile()
        if (imageFile) {
          e.preventDefault()
          e.stopPropagation()
          const formData = new FormData()
          formData.append('file', imageFile)
          formData.append('category', 'keep')
          uploadImage(formData)
          break
        }
      }
    }
  }, [uploadImage, isFocused])

  React.useEffect(() => {
    if (typeof window === 'undefined')
      return
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const handleSave = () => {
    if (!content.trim())
      return

    if (id) {
      updateMutate({ id, content, isPublic })
    }
    else {
      createMutate({ content, isPublic })
    }
  }

  const wordCount = content.length
  const lineCount = content.split('\n').length

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/keep')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">
              {id ? '编辑笔记' : '新建笔记'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 字数统计 */}
          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {wordCount}
              {' '}
              字符
            </span>
            <span>
              {lineCount}
              {' '}
              行
            </span>
          </div>

          {/* 公开/私密切换 */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            {isPublic
              ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                )
              : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
            <span className="text-sm">{isPublic ? '公开' : '私密'}</span>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
              className="ml-1"
            />
          </div>

          {/* 保存按钮 */}
          <Button
            onClick={handleSave}
            disabled={isPending || !content.trim()}
            className="gap-2"
          >
            {isPending
              ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    保存中...
                  </>
                )
              : (
                  <>
                    <Save className="w-4 h-4" />
                    保存
                  </>
                )}
          </Button>
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-[800px] overflow-hidden border">
          {/* Toolbar */}
          <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              支持 Ctrl+V 粘贴图片
            </span>
            {isUploading && (
              <span className="text-xs text-primary flex items-center gap-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
                上传中...
              </span>
            )}
          </div>

          {/* Editor Content */}
          <div
            className="h-[calc(800px-41px)]"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <MdEditor
              value={content}
              onChange={setContent}
              placeholder="开始输入内容..."
              className="h-full"
            />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
