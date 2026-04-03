'use client'

import type { Keep } from '@prisma/client'
import { markdown } from '@codemirror/lang-markdown'
import { EditorSelection } from '@codemirror/state'
import { EditorView, placeholder } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bold,
  Eye,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { Markdown } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'

interface KeepEditorProps {
  keep?: Keep | null
  initialCategory?: string
}

type ViewMode = 'edit' | 'split' | 'preview'
interface KeepDraft {
  content: string
  category: string
  isPublic: boolean
  updatedAt: number
}
interface PendingImagePreview {
  file: File
  url: string
  from: number
  to: number
}

const KEEP_DRAFT_DB = 'us4ever-keep-editor'
const KEEP_DRAFT_STORE = 'drafts'

function openKeepDraftDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(KEEP_DRAFT_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(KEEP_DRAFT_STORE)) {
        db.createObjectStore(KEEP_DRAFT_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getKeepDraft(key: string): Promise<KeepDraft | null> {
  const db = await openKeepDraftDb()
  return new Promise<KeepDraft | null>((resolve, reject) => {
    const tx = db.transaction(KEEP_DRAFT_STORE, 'readonly')
    const store = tx.objectStore(KEEP_DRAFT_STORE)
    const request = store.get(key)
    request.onsuccess = () => resolve((request.result as KeepDraft | undefined) ?? null)
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

async function setKeepDraft(key: string, value: KeepDraft): Promise<void> {
  const db = await openKeepDraftDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KEEP_DRAFT_STORE, 'readwrite')
    const store = tx.objectStore(KEEP_DRAFT_STORE)
    store.put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }).finally(() => db.close())
}

async function removeKeepDraft(key: string): Promise<void> {
  const db = await openKeepDraftDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KEEP_DRAFT_STORE, 'readwrite')
    const store = tx.objectStore(KEEP_DRAFT_STORE)
    store.delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }).finally(() => db.close())
}

function insertIntoEditor(view: EditorView, text: string) {
  const selection = view.state.selection.main
  const from = selection.from
  const to = selection.to
  const nextAnchor = from + text.length

  view.dispatch({
    changes: { from, to, insert: text },
    selection: EditorSelection.cursor(nextAnchor),
    scrollIntoView: true,
  })
  view.focus()
}

function insertIntoEditorRange(view: EditorView, text: string, from: number, to: number) {
  const nextAnchor = from + text.length
  view.dispatch({
    changes: { from, to, insert: text },
    selection: EditorSelection.cursor(nextAnchor),
    scrollIntoView: true,
  })
  view.focus()
}

function wrapCurrentSelection(view: EditorView, before: string, after: string = before) {
  const selection = view.state.selection.main
  const from = selection.from
  const to = selection.to
  const selectedText = view.state.doc.sliceString(from, to)
  const wrapped = `${before}${selectedText}${after}`

  view.dispatch({
    changes: { from, to, insert: wrapped },
    selection: EditorSelection.range(from + before.length, from + before.length + selectedText.length),
    scrollIntoView: true,
  })
  view.focus()
}

function prefixSelectedLines(view: EditorView, prefix: string) {
  const selection = view.state.selection.main
  if (selection.empty) {
    const line = view.state.doc.lineAt(selection.from)
    view.dispatch({
      changes: { from: line.from, to: line.from, insert: prefix },
      selection: EditorSelection.cursor(selection.from + prefix.length),
      scrollIntoView: true,
    })
    view.focus()
    return
  }

  const fromLine = view.state.doc.lineAt(selection.from)
  const toLine = view.state.doc.lineAt(selection.to)
  const blockFrom = fromLine.from
  const blockTo = toLine.to
  const rawBlock = view.state.doc.sliceString(blockFrom, blockTo)
  const lines = rawBlock.split('\n')
  const nextBlock = lines.map(line => `${prefix}${line}`).join('\n')
  const lineCount = lines.length
  const prefixedLength = prefix.length * lineCount

  view.dispatch({
    changes: { from: blockFrom, to: blockTo, insert: nextBlock },
    selection: EditorSelection.range(selection.from + prefix.length, selection.to + prefixedLength),
    scrollIntoView: true,
  })
  view.focus()
}

export default function KeepEditor({ keep, initialCategory }: KeepEditorProps) {
  const id = keep?.id
  const router = useRouter()
  const editorViewRef = useRef<EditorView | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const draftReadyRef = useRef(false)
  const pendingImageInsertRangeRef = useRef<{ from: number, to: number } | null>(null)

  const [content, setContent] = useState(keep?.content ?? '')
  const [isPublic, setIsPublic] = useState(keep?.isPublic ?? false)
  const [category, setCategory] = useState(keep?.category ?? initialCategory ?? 'default')
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'restored'>('idle')
  const [pendingImagePreview, setPendingImagePreview] = useState<PendingImagePreview | null>(null)

  const isMobile = useMediaQuery('(max-width: 768px)', {
    initializeWithValue: false,
    defaultValue: true,
  })
  const draftKey = useMemo(
    () => `keep-editor:${id ?? 'new'}:${initialCategory ?? keep?.category ?? 'default'}`,
    [id, initialCategory, keep?.category],
  )

  const clearDraft = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      await removeKeepDraft(draftKey)
      setDraftStatus('idle')
    }
    catch {
      // no-op
    }
  }, [draftKey])

  useEffect(() => {
    setViewMode(prev => (isMobile ? 'edit' : prev))
  }, [isMobile])

  const insertText = useCallback((text: string) => {
    const view = editorViewRef.current
    if (!view) {
      setContent(prev => prev + text)
      return
    }
    insertIntoEditor(view, text)
  }, [])

  const wrapSelection = useCallback((before: string, after: string = before) => {
    const view = editorViewRef.current
    if (!view) {
      return
    }
    wrapCurrentSelection(view, before, after)
  }, [])

  const { mutate: createMutate, isPending: isCreatePending } = api.keep.create.useMutation({
    onSuccess: (data) => {
      void clearDraft()
      router.replace(`/keep/${data.id}`)
    },
  })

  const { mutate: updateMutate, isPending: isUpdatePending } = api.keep.update.useMutation({
    onSuccess: (data) => {
      void clearDraft()
      router.replace(`/keep/${data.id}`)
    },
  })

  const { mutate: uploadImage, isPending: isUploading } = api.admin.uploadImage.useMutation({
    onSuccess: (data) => {
      const markdownImage = `\n![${data.id || ''}](${data.compressed_url})\n`
      const view = editorViewRef.current
      const pendingRange = pendingImageInsertRangeRef.current
      if (view && pendingRange) {
        insertIntoEditorRange(view, markdownImage, pendingRange.from, pendingRange.to)
      }
      else {
        insertText(markdownImage)
      }
      pendingImageInsertRangeRef.current = null
    },
  })

  const isPending = isCreatePending || isUpdatePending

  const handleSave = useCallback(() => {
    if (!content.trim()) {
      return
    }

    if (id) {
      updateMutate({ id, content, isPublic, category })
    }
    else {
      createMutate({ content, isPublic, category })
    }
  }, [category, content, createMutate, id, isPublic, updateMutate])

  const handleImagePaste = useCallback((event: ClipboardEvent, view: EditorView) => {
    const items = event.clipboardData?.items
    if (!items) {
      return false
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item?.type.includes('image')) {
        continue
      }
      const imageFile = item.getAsFile()
      if (!imageFile) {
        continue
      }

      event.preventDefault()
      const selection = view.state.selection.main
      const imageObjectUrl = window.URL.createObjectURL(imageFile)
      setPendingImagePreview((prev) => {
        if (prev) {
          window.URL.revokeObjectURL(prev.url)
        }
        return {
          file: imageFile,
          url: imageObjectUrl,
          from: selection.from,
          to: selection.to,
        }
      })
      return true
    }

    return false
  }, [])

  const cmExtensions = useMemo(() => {
    const keyAndPasteHandlers = EditorView.domEventHandlers({
      keydown: (event, view) => {
        if (event.key === 'Tab') {
          event.preventDefault()
          insertIntoEditor(view, '  ')
          return true
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          handleSave()
          return true
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
          event.preventDefault()
          wrapCurrentSelection(view, '**')
          return true
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
          event.preventDefault()
          wrapCurrentSelection(view, '*')
          return true
        }

        return false
      },
      paste: (event, view) => {
        return handleImagePaste(event, view)
      },
    })

    const visualTheme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '15px',
      },
      '.cm-scroller': {
        height: '100%',
        overflow: 'auto',
        fontFamily: '"LXGW", "LXGW WenKai", "Fira Code", "PingFang SC", "Microsoft YaHei", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        lineHeight: '1.75',
      },
      '.cm-content': {
        padding: '24px',
        minHeight: '100%',
        whiteSpace: 'pre-wrap',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-cursor': {
        borderLeftColor: 'hsl(var(--primary))',
      },
      '.cm-selectionBackground': {
        backgroundColor: 'hsl(var(--primary) / 0.22) !important',
      },
      '&.cm-editor .cm-line': {
        wordBreak: 'normal',
      },
      '.cm-strikethrough': {
        textDecoration: 'line-through',
        textDecorationThickness: '1.5px',
        opacity: '0.92',
      },
    })

    return [markdown(), placeholder('开始输入 Markdown 内容...'), EditorView.lineWrapping, keyAndPasteHandlers, visualTheme]
  }, [handleImagePaste, handleSave])

  const handleCancelImageUpload = useCallback(() => {
    setPendingImagePreview((prev) => {
      if (prev) {
        window.URL.revokeObjectURL(prev.url)
      }
      return null
    })
    pendingImageInsertRangeRef.current = null
  }, [])

  const handleConfirmImageUpload = useCallback(() => {
    if (!pendingImagePreview) {
      return
    }
    pendingImageInsertRangeRef.current = {
      from: pendingImagePreview.from,
      to: pendingImagePreview.to,
    }

    const formData = new FormData()
    formData.append('file', pendingImagePreview.file)
    formData.append('category', 'keep')
    uploadImage(formData)
    setPendingImagePreview((prev) => {
      if (prev) {
        window.URL.revokeObjectURL(prev.url)
      }
      return null
    })
  }, [pendingImagePreview, uploadImage])

  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        window.URL.revokeObjectURL(pendingImagePreview.url)
      }
    }
  }, [pendingImagePreview])

  const toolbarActions = useMemo(() => ({
    bold: () => wrapSelection('**'),
    italic: () => wrapSelection('*'),
    strikethrough: () => wrapSelection('~~'),
    heading: () => {
      const view = editorViewRef.current
      if (!view) {
        setContent(prev => `## ${prev}`)
        return
      }
      prefixSelectedLines(view, '## ')
    },
    quote: () => {
      const view = editorViewRef.current
      if (!view) {
        insertText('\n> ')
        return
      }
      prefixSelectedLines(view, '> ')
    },
    unorderedList: () => {
      const view = editorViewRef.current
      if (!view) {
        insertText('\n- ')
        return
      }
      prefixSelectedLines(view, '- ')
    },
    orderedList: () => {
      const view = editorViewRef.current
      if (!view) {
        insertText('\n1. ')
        return
      }
      prefixSelectedLines(view, '1. ')
    },
    horizontalRule: () => insertText('\n---\n'),
  }), [insertText, wrapSelection])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    let canceled = false
    ;(async () => {
      try {
        const draft = await getKeepDraft(draftKey)
        if (canceled || !draft) {
          return
        }

        const shouldRestore = !keep?.content?.trim()
        if (shouldRestore) {
          setContent(draft.content ?? '')
          setCategory(draft.category || initialCategory || 'default')
          setIsPublic(Boolean(draft.isPublic))
          setDraftStatus('restored')
        }
      }
      catch {
        // no-op
      }
      finally {
        draftReadyRef.current = true
      }
    })()
    return () => {
      canceled = true
    }
  }, [draftKey, initialCategory, keep?.content])

  useEffect(() => {
    if (!draftReadyRef.current || typeof window === 'undefined') {
      return
    }
    const timer = window.setTimeout(async () => {
      try {
        setDraftStatus('saving')
        await setKeepDraft(draftKey, {
          content,
          category,
          isPublic,
          updatedAt: Date.now(),
        })
        setDraftStatus('saved')
      }
      catch {
        setDraftStatus('idle')
      }
    }, 600)
    return () => window.clearTimeout(timer)
  }, [category, content, draftKey, isPublic])

  useEffect(() => {
    if (viewMode !== 'split') {
      return
    }

    const view = editorViewRef.current
    const preview = previewRef.current
    if (!view || !preview) {
      return
    }

    const editorScroller = view.scrollDOM
    let syncingFromEditor = false
    let syncingFromPreview = false

    const syncPreview = () => {
      if (syncingFromPreview) {
        return
      }
      const editorRange = editorScroller.scrollHeight - editorScroller.clientHeight
      if (editorRange <= 0) {
        preview.scrollTop = 0
        return
      }
      syncingFromEditor = true
      const ratio = editorScroller.scrollTop / editorRange
      const previewRange = preview.scrollHeight - preview.clientHeight
      preview.scrollTop = Math.max(0, ratio * previewRange)
      requestAnimationFrame(() => {
        syncingFromEditor = false
      })
    }

    const syncEditor = () => {
      if (syncingFromEditor) {
        return
      }
      const previewRange = preview.scrollHeight - preview.clientHeight
      if (previewRange <= 0) {
        editorScroller.scrollTop = 0
        return
      }
      syncingFromPreview = true
      const ratio = preview.scrollTop / previewRange
      const editorRange = editorScroller.scrollHeight - editorScroller.clientHeight
      editorScroller.scrollTop = Math.max(0, ratio * editorRange)
      requestAnimationFrame(() => {
        syncingFromPreview = false
      })
    }

    editorScroller.addEventListener('scroll', syncPreview, { passive: true })
    preview.addEventListener('scroll', syncEditor, { passive: true })
    syncPreview()

    return () => {
      editorScroller.removeEventListener('scroll', syncPreview)
      preview.removeEventListener('scroll', syncEditor)
    }
  }, [viewMode])

  const wordCount = content.length
  const lineCount = content.split('\n').length

  return (
    <div className="mx-auto flex h-[calc(100dvh-132px)] max-w-7xl flex-col gap-4 md:h-[calc(100dvh-104px)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {id ? '编辑笔记' : '新建笔记'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border bg-muted/50 p-1">
            <Button
              variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="h-7 gap-1.5 px-2"
            >
              <span className="text-xs">编辑</span>
            </Button>
            {!isMobile && (
              <Button
                variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="h-7 gap-1.5 px-2"
              >
                <span className="text-xs">分栏</span>
              </Button>
            )}
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="h-7 gap-1.5 px-2"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden text-xs sm:inline">预览</span>
            </Button>
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />

          <div className="hidden items-center gap-3 text-sm text-muted-foreground lg:flex">
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

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">分类:</span>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={isPending}
              placeholder="默认分类"
              className="w-24 border-b border-border/50 bg-transparent px-1 py-0.5 text-sm transition-all focus:border-primary focus:outline-none sm:w-32"
            />
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            {isPublic
              ? (
                  <Globe className="h-4 w-4 text-emerald-500" />
                )
              : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
            <span className="hidden text-sm sm:inline">{isPublic ? '公开' : '私密'}</span>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
              className="ml-1"
            />
          </div>

          <div className="h-4 w-px bg-border" />

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
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    保存中...
                  </>
                )
              : (
                  <>
                    <Save className="h-4 w-4" />
                    保存
                  </>
                )}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="min-h-0 flex-1"
      >
        <Card className="flex h-full min-h-0 flex-col overflow-hidden border">
          <div className="flex h-12 shrink-0 items-center gap-1 overflow-hidden border-b bg-muted/50 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.bold}
              className="h-8 w-8 p-0"
              title="加粗 (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.italic}
              className="h-8 w-8 p-0"
              title="斜体 (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.strikethrough}
              className="h-8 w-8 p-0"
              title="删除线"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.heading}
              className="h-8 w-8 p-0"
              title="标题"
            >
              <Heading className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.quote}
              className="h-8 w-8 p-0"
              title="引用"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.unorderedList}
              className="h-8 w-8 p-0"
              title="无序列表"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.orderedList}
              className="h-8 w-8 p-0"
              title="有序列表"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.horizontalRule}
              className="h-8 w-8 p-0"
              title="分割线"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              草稿:
              {' '}
              {draftStatus === 'saving' && '保存中'}
              {draftStatus === 'saved' && '已保存'}
              {draftStatus === 'restored' && '已恢复'}
              {draftStatus === 'idle' && '未变更'}
            </span>
            {isUploading && (
              <span className="hidden items-center gap-1 text-xs text-primary md:flex">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-3 w-3" />
                </motion.div>
                上传中...
              </span>
            )}
            <span className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
              <ImageIcon className="h-3 w-3" />
              Ctrl+V 粘贴图片 | Ctrl+S 保存
            </span>
          </div>

          <div className="flex h-[calc(100%-48px)] bg-background">
            <div
              className={cn(
                'min-h-0 flex-1 bg-background',
                viewMode === 'split' && 'w-1/2',
                viewMode === 'preview' && 'hidden',
              )}
            >
              <CodeMirror
                value={content}
                onCreateEditor={view => (editorViewRef.current = view)}
                onChange={value => setContent(value)}
                extensions={cmExtensions}
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  highlightActiveLine: false,
                  highlightActiveLineGutter: false,
                  dropCursor: false,
                  allowMultipleSelections: false,
                }}
                className="h-full min-h-0 [&_.cm-editor]:h-full [&_.cm-editor]:bg-transparent [&_.cm-editor]:text-foreground [&_.cm-gutters]:hidden [&_.cm-scroller]:font-medium [&_.cm-scroller]:overflow-auto"
              />
            </div>

            {viewMode === 'split' && (
              <div className="w-px shrink-0 bg-border" />
            )}

            <div
              ref={previewRef}
              className={cn(
                'h-full overflow-auto bg-muted/10',
                viewMode === 'edit' && 'hidden',
                viewMode === 'split' && 'flex-1 w-1/2',
                viewMode === 'preview' && 'flex-1',
              )}
            >
              <div className="h-full p-6">
                {content.trim()
                  ? (
                      <Markdown className="prose prose-sm max-w-none dark:prose-invert">
                        {content}
                      </Markdown>
                    )
                  : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground/60">
                        在此区域查看 Markdown 实时渲染预览...
                      </div>
                    )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog
        open={Boolean(pendingImagePreview)}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelImageUpload()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>确认上传图片</DialogTitle>
            <DialogDescription>
              这是你刚刚粘贴的图片，确认后会上传并插入到当前光标位置。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-auto rounded-md border bg-muted/20 p-2">
            {pendingImagePreview && (
              <img
                src={pendingImagePreview.url}
                alt="粘贴图片预览"
                className="mx-auto max-h-[50vh] w-auto rounded object-contain"
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelImageUpload}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleConfirmImageUpload}
              disabled={isUploading || !pendingImagePreview}
              className="gap-2"
            >
              {isUploading ? '上传中...' : '确认上传'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
