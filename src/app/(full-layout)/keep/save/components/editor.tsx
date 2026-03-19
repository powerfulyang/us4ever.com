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
import Prism from 'prismjs'
import * as React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import Editor from 'react-simple-code-editor'
import { Markdown } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'

import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism.css'

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

  const editorRef = useRef<any>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // 同步滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (viewMode !== 'split')
      return
    const container = e.currentTarget
    const preview = previewRef.current
    if (!container || !preview)
      return

    const percentage = container.scrollTop / (container.scrollHeight - container.clientHeight)
    if (!Number.isNaN(percentage)) {
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
    }
  }, [viewMode])

  // 插入文本到光标位置
  const insertText = useCallback((text: string) => {
    const textarea = editorRef.current?._input
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
    const textarea = editorRef.current?._input
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

  const handleSave = useCallback(() => {
    if (!content.trim())
      return

    if (id) {
      updateMutate({ id, content, isPublic })
    }
    else {
      createMutate({ content, isPublic })
    }
  }, [content, createMutate, id, isPublic, updateMutate])

  // 工具栏操作
  const toolbarActions = useMemo(() => ({
    bold: () => wrapSelection('**'),
    italic: () => wrapSelection('*'),
    strikethrough: () => wrapSelection('~~'),
    heading: () => {
      const textarea = editorRef.current?._input
      if (!textarea)
        return

      const start = textarea.selectionStart
      // Find the start of the current line
      const lineStart = content.lastIndexOf('\n', start - 1) + 1
      const beforeCursor = content.substring(0, lineStart)
      const afterCursor = content.substring(lineStart)

      setContent(`${beforeCursor}## ${afterCursor}`)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 3, start + 3)
      }, 0)
    },
    quote: () => insertText('\n> '),
    unorderedList: () => insertText('\n- '),
    orderedList: () => insertText('\n1. '),
    horizontalRule: () => insertText('\n---\n'),
  }), [content, insertText, wrapSelection])

  // 快捷键和缩进处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 处理 Tab 键
    if (e.key === 'Tab') {
      e.preventDefault()
      insertText('  ')
    }
    // 处理 Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
    // 快捷键支持
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      toolbarActions.bold()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      toolbarActions.italic()
    }
  }, [insertText, handleSave, toolbarActions])

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

  const wordCount = content.length
  const lineCount = content.split('\n').length

  return (
    <div className="max-w-7xl mx-auto space-y-4 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
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
            onClick={() => router.back()}
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
              title="加粗 (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.italic}
              className="h-8 w-8 p-0"
              title="斜体 (Ctrl+I)"
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
              Ctrl+V 粘贴图片 | Ctrl+S 保存
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 flex bg-background">
            {/* 编辑区 */}
            <div
              onScroll={handleScroll}
              className={cn(
                'flex-1 overflow-y-auto bg-background relative',
                viewMode === 'split' && 'w-1/2',
                viewMode === 'preview' && 'hidden',
              )}
            >
              <div className="min-h-full">
                <Editor
                  ref={editorRef}
                  value={content}
                  onValueChange={code => setContent(code)}
                  highlight={code => Prism.highlight(code, Prism.languages.markdown!, 'markdown')}
                  padding={24}
                  placeholder="开始输入 Markdown 内容..."
                  className="font-mono text-[15px] leading-relaxed text-foreground min-h-full"
                  textareaClassName="outline-none focus:ring-0 shadow-none border-none resize-none caret-primary"
                  preClassName="whitespace-pre-wrap break-all pointer-events-none"
                  style={{
                    fontFamily: '\'Fira Code\', \'JetBrains Mono\', Consolas, Monaco, monospace, \'LXGW\'',
                  }}
                  onKeyDown={handleKeyDown as any}
                  onPaste={handlePaste as any}
                />
              </div>
            </div>

            {/* 分割线 */}
            {viewMode === 'split' && (
              <div className="w-px bg-border shrink-0" />
            )}

            {/* 预览区 */}
            <div
              ref={previewRef}
              className={cn(
                'h-full overflow-auto bg-muted/10',
                viewMode === 'edit' && 'hidden',
                viewMode === 'split' && 'flex-1 w-1/2',
                viewMode === 'preview' && 'flex-1',
              )}
            >
              <div className="p-6 h-full">
                {content.trim()
                  ? (
                      <Markdown className="prose prose-sm max-w-none dark:prose-invert">
                        {content}
                      </Markdown>
                    )
                  : (
                      <div className="text-muted-foreground/60 text-sm h-full flex items-center justify-center">
                        在此区域查看 Markdown 实时渲染预览...
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
