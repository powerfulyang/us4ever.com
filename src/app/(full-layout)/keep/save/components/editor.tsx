'use client'

import type { Monaco } from '@monaco-editor/react'
import type { Keep } from '@prisma/client'
import type { editor } from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import dynamic from 'next/dynamic'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Back } from '@/app/(full-layout)/keep/components/back'
import { MdRender } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

const MdEditor = dynamic(
  async () => {
    await loader.init()
    return import('@/components/md-editor')
  },
  {
    ssr: false,
    loading: () => <LoadingSpinner text="加载编辑器中..." />,
  },
)

interface KeepEditorProps {
  keep?: Keep | null
}

export default function KeepEditor({ keep }: KeepEditorProps) {
  const id = keep?.id
  const editorRef = useRef<any>(null)
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

  const { mutate: uploadImage, isPending: isUploading } = api.asset.upload_image.useMutation({
    onSuccess: (data) => {
      if (editorRef.current) {
        const editor = editorRef.current
        const selection = editor.getSelection()
        const markdownImage = `![${data.name || ''}](${data.compressed_url})`
        editor.executeEdits('paste-image', [{
          range: selection,
          text: markdownImage,
          forceMoveMarkers: true,
        }])
        editor.focus()
      }
    },
    onError: (error) => {
      console.error('图片上传失败:', error)
    },
  })

  const isPending = isCreatePending || isUpdatePending

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    editorRef.current = editor

    // 监听编辑器焦点变化
    editor.onDidFocusEditorWidget(() => {
      setEditorHasFocus(true)
    })

    editor.onDidBlurEditorWidget(() => {
      setEditorHasFocus(false)
    })

    editor.onDidPaste(({ range }) => {
      // 阻止默认的粘贴行为
      // 请注意，这种方法可能不会完全阻止默认行为，取决于monaco-editor的内部实现
      // 你可能需要寻找更直接的方法来完全控制粘贴过程
      const op2 = { range, text: '', forceMoveMarkers: true }
      editor.pushUndoStop()
      editor.executeEdits('', [op2])
      editor.pushUndoStop()
    })
  }

  // 处理图片粘贴
  useEffect(() => {
    if (typeof window === 'undefined')
      return

    const handlePaste = async (e: ClipboardEvent) => {
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
      else {
        // 非图片粘贴
        if (editorRef.current) {
          const editor = editorRef.current
          const selection = editor.getSelection()
          // 获取剪贴板内容
          const clipboardText = e.clipboardData?.getData('text')
          editor.executeEdits('paste-text', [{
            range: selection,
            text: clipboardText || '',
            forceMoveMarkers: true,
          }])
          editor.focus()
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [uploadImage, editorHasFocus])

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
        className="inline-flex animate-bounce items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-3 ml-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>返回笔记列表</span>
      </Back>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            >
              {id ? '编辑笔记' : '创建新笔记'}
            </h1>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                <span>上传图片中...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isPending || !content}
              isLoading={isPending}
              className={cn(
                'rounded-lg transition-all duration-200',
                'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
                'text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
              )}
            >
              {isPending ? '保存中...' : '保存笔记'}
            </Button>
          </div>
        </div>

        <div className="h-[55vh] grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="relative rounded-lg overflow-hidden shadow-inner bg-gray-900">
            <MdEditor
              value={content}
              language="markdown"
              onChange={v => setContent(v || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontFamily: 'Fira Code, LXGW, monospace',
                fontSize: 14,
                lineHeight: 22,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                pasteAs: {
                  enabled: false,
                },
              }}
              theme="vs-dark"
            />
            {/* 功能提示 */}
            {editorHasFocus && (
              <div className={cn(
                'absolute top-4 right-4 z-10 transition-all duration-300',
                'bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg',
                'border border-gray-700 shadow-lg flex items-center gap-2',
                isUploading && 'opacity-0',
              )}
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Ctrl+V 粘贴图片</span>
              </div>
            )}
          </div>

          <div className="rounded-lg overflow-hidden shadow-inner bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                预览
              </h3>
            </div>
            <div className="p-4 overflow-y-auto max-w-none h-full">
              <MdRender enableMermaid>
                {content || '*开始输入内容，这里会实时显示预览...*'}
              </MdRender>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
