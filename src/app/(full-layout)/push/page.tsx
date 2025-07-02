'use client'

import React, { useState } from 'react'
import { sendNotification } from '@/app/actions/web-push'
import PushNotificationManager from '@/components/pwa/PushNotificationManager'
import { Button } from '@/components/ui'

export default function PushPage() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message)
      return

    try {
      const result = await sendNotification(message)
      if (result.success) {
        setStatus('通知发送成功')
        setMessage('')
      }
      else {
        setStatus(`发送失败: ${result.error || '未知错误'}`)
      }
    }
    catch (error) {
      setStatus(`发送失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">推送通知测试</h1>

      <div className="mb-8">
        <PushNotificationManager />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-white">
            通知内容
          </label>
          <textarea
            id="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full rounded-lg border p-2"
            rows={3}
            placeholder="输入要发送的通知内容..."
          />
        </div>

        <Button
          disabled={!message}
          type="submit"
        >
          发送通知
        </Button>

        {status && (
          <p className={`mt-4 rounded-lg p-2 ${
            status.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  )
}
