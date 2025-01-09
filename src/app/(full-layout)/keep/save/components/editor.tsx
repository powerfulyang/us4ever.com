'use client'

import type { Keep } from '@prisma/client'

import { Back } from '@/components/keep/back'
import { MdRender } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import { loader } from '@monaco-editor/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

  const router = useRouter()
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)

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

  const isPending = isCreatePending || isUpdatePending

  useEffect(() => {
    if (keep) {
      setContent(keep.content)
      setIsPublic(keep.isPublic)
    }
  }, [keep])

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
        <span>返回</span>
      </Back>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h1
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            >
              {id ? '编辑笔记' : '新建笔记'}
            </h1>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isPending}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isPending}
            isLoading={isPending}
          >
            保存
          </Button>
        </div>

        <div className="h-[55vh] box-content grid grid-cols-1 sm:grid-cols-2 gap-1">
          <MdEditor
            value={content}
            language="markdown"
            onChange={v => setContent(v || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontFamily: 'Fira Code, sans-serif',
              pasteAs: {
                enabled: false,
              },
            }}
            theme="vs-dark"
          />
          <div className="hidden sm:block rounded overflow-y-auto p-2 border border-amber-200">
            <MdRender>
              {content}
            </MdRender>
          </div>
        </div>
      </Card>
    </div>
  )
}
