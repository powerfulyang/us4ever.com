'use client'

import type { Keep } from '@prisma/client'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bold,
  Eye,
  FileText,
  Globe,
  Heading,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Lock,
  Minus,
  Quote,
  Save,
  Sparkles,
  Strikethrough,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import SimpleMDE from 'react-simplemde-editor'
import { Markdown } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import 'easymde/dist/easymde.min.css'
import './editor.css'

interface KeepEditorProps {
  keep?: Keep | null
}

type ViewMode = 'edit' | 'split' | 'preview'

export default function KeepEditor({ keep }: KeepEditorProps) {
  const id = keep?.id
  const router = useRouter()
  const [content, setContent] = useState(keep?.content ?? '')
  const [isPublic, setIsPublic] = useState(keep?.isPublic ?? false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 插入文本到光标位置
  const insertText = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent(prev => prev + text)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }, [content])

  // 包装选中文本
  const wrapSelection = useCallback((before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea)
      return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }, [content])

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
      insertText(markdownImage)
    },
  })

  const isPending = isCreatePending || isUpdatePending

  // 工具栏操作
  const toolbarActions = {
    bold: () => wrapSelection('**'),
    italic: () => wrapSelection('*'),
    strikethrough: () => wrapSelection('~~'),
    heading: () => insertText('\n## '),
    quote: () => insertText('\n> '),
    unorderedList: () => insertText('\n- '),
    orderedList: () => insertText('\n1. '),
    horizontalRule: () => insertText('\n---\n'),
  }

  // 处理图片粘贴
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items)
      return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item?.type.includes('image')) {
        const imageFile = item.getAsFile()
        if (imageFile) {
          e.preventDefault()
          const formData = new FormData()
          formData.append('file', imageFile)
          formData.append('category', 'keep')
          uploadImage(formData)
          break
        }
      }
    }
  }, [uploadImage])

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
    <div className="max-w-7xl mx-auto space-y-4 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0"
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 视图切换 */}
          <div className="flex items-center border rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="gap-1.5 h-7 px-2"
            >
              <span className="text-xs">编辑</span>
            </Button>
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="gap-1.5 h-7 px-2"
            >
              <span className="text-xs">分栏</span>
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="gap-1.5 h-7 px-2"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">预览</span>
            </Button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

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

          <div className="h-4 w-px bg-border" />

          {/* 公开/私密切换 */}
          <div className="flex items-center gap-2">
            {isPublic
              ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                )
              : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
            <span className="text-sm hidden sm:inline">{isPublic ? '公开' : '私密'}</span>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
              className="ml-1"
            />
          </div>

          <div className="h-4 w-px bg-border" />

          {/* 保存按钮 */}
          <Button
            onClick={handleSave}
            disabled={isPending || !content.trim()}
            className="gap-2"
            size="sm"
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

      {/* Editor Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-0"
      >
        <Card className="h-full overflow-hidden border flex flex-col">
          {/* Custom Toolbar */}
          <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-1 shrink-0 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.bold}
              className="h-8 w-8 p-0"
              title="加粗"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.italic}
              className="h-8 w-8 p-0"
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.strikethrough}
              className="h-8 w-8 p-0"
              title="删除线"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.heading}
              className="h-8 w-8 p-0"
              title="标题"
            >
              <Heading className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.quote}
              className="h-8 w-8 p-0"
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.unorderedList}
              className="h-8 w-8 p-0"
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.orderedList}
              className="h-8 w-8 p-0"
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.horizontalRule}
              className="h-8 w-8 p-0"
              title="分割线"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
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
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Ctrl+V 粘贴图片
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 flex">
            {/* 编辑区 */}
            <div
              className={cn(
                'h-full overflow-hidden',
                viewMode === 'edit' && 'flex-1',
                viewMode === 'split' && 'flex-1 w-1/2',
                viewMode === 'preview' && 'hidden',
              )}
              onPaste={handlePaste}
            >
              <SimpleMDE
                value={content}
                onChange={setContent}
                options={{
                  autofocus: false,
                  spellChecker: false,
                  status: false,
                  toolbar: false,
                  placeholder: '开始输入内容...',
                }}
                getMdeInstance={(instance) => {
                  // 获取底层 textarea 用于操作
                  const textarea = instance.element as HTMLTextAreaElement
                  textareaRef.current = textarea
                }}
                className="h-full custom-mde"
              />
            </div>

            {/* 分割线 */}
            {viewMode === 'split' && (
              <div className="w-px bg-border shrink-0" />
            )}

            {/* 预览区 - 使用项目自己的 Markdown 渲染 */}
            <div
              className={cn(
                'h-full overflow-auto bg-background',
                viewMode === 'edit' && 'hidden',
                viewMode === 'split' && 'flex-1 w-1/2',
                viewMode === 'preview' && 'flex-1',
              )}
            >
              <div className="p-6">
                {content.trim()
                  ? (
                      <Markdown className="prose prose-sm max-w-none dark:prose-invert">
                        {content}
                      </Markdown>
                    )
                  : (
                      <div className="text-muted-foreground text-sm text-center py-20">
                        预览区域，开始输入内容查看效果...
                      </div>
                    )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
