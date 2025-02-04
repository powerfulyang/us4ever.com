'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils'
import Link from 'next/link'
import { useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer-continued'

export default function DiffPage() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')

  const handleReset = () => {
    setOldText('')
    setNewText('')
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Link href="/" className="text-xl font-semibold text-gray-900">Online Diff</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">原始文本</label>
          <Textarea
            value={oldText}
            onChange={e => setOldText(e.target.value)}
            placeholder="请输入原始文本..."
            className="font-mono resize-none"
            rows={5}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600">新文本</label>
          <Textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="请输入新文本..."
            className="font-mono resize-none"
            rows={5}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
        >
          重置
        </Button>
      </div>

      <div className={
        cn('border rounded-lg p-4 bg-white', {
          hidden: !oldText || !newText,
        })
      }
      >
        <ReactDiffViewer
          oldValue={oldText}
          newValue={newText}
          splitView
          hideLineNumbers={false}
          showDiffOnly={false}
          useDarkTheme={false}
          styles={{
            diffContainer: {
              pre: {
                fontSize: '14px',
                lineHeight: '1.4',
              },
            },
            contentText: {
              backgroundColor: '#fff',
            },
          }}
        />
      </div>
    </div>
  )
}
