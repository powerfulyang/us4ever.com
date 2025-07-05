'use client'

import { Upload } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'

export function MindMapImport() {
  const [isPending, setIsPending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const utils = api.useUtils()

  const { mutateAsync } = api.mindMap.createByXMind.useMutation({
    onSuccess() {
      setFile(null)
      return utils.mindMap.fetchByCursor.invalidate()
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
    <div className="flex items-center justify-end gap-4 flex-wrap w-full">
      <label
        htmlFor="xmind-upload"
        className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white text-xs"
      >
        <Upload className="w-4 h-4" />
        <span className="truncate flex-1">
          {file ? file.name : '选择 XMind 文件'}
        </span>
        <input
          id="xmind-upload"
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
      <AuthenticatedOnly disableChildren>
        <Button
          onClick={handleParse}
          disabled={!file || isPending}
        >
          {isPending ? '解析中...' : '开始解析'}
        </Button>
      </AuthenticatedOnly>
    </div>
  )
}
