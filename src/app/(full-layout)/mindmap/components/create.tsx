'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

export function MindMapImport() {
  const [isPending, setIsPending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const utils = api.useUtils()

  const { mutateAsync } = api.mindmap.createByXmind.useMutation({
    onSuccess() {
      setFile(null)
      return utils.mindmap.list.invalidate()
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.xmind')) {
        toast.error('请选择 .xmind 格式的文件')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleParse = async () => {
    setIsPending(true)
    try {
      const parseXMindFile = await import('@/lib/xmind').then(m => m.parseXMindFile)
      const content = await parseXMindFile(file!)
      const title = content.data?.text
      await mutateAsync({ content, title, isPublic })
    }
    catch (e) {
      toast.error(e.message)
    }
    finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="file"
        accept=".xmind"
        onChange={handleFileChange}
        disabled={isPending}
        className="hidden"
        id="xmind-upload"
      />
      <label
        htmlFor="xmind-upload"
        className="flex items-center gap-1 cursor-pointer px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white text-sm"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {file ? file.name : '选择 XMind 文件'}
        <input
          type="file"
          accept=".xmind"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>
      <Switch
        checked={isPublic}
        onCheckedChange={setIsPublic}
        disabled={isPending}
      />
      <Button
        onClick={handleParse}
        disabled={!file || isPending}
        className="ml-auto"
      >
        {isPending ? '解析中...' : '开始解析'}
      </Button>
    </div>
  )
}
