'use client'

import React, { useEffect, useState } from 'react'

export default function TTSPage() {
  const [text, setText] = useState('Hello, world! 这是一个基于 edge-tts-universal 的测试文本。')
  const [voices, setVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState('zh-CN-XiaoxiaoNeural')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 获取可用声音列表
    fetch('/api/tts/voices?locale=zh')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVoices(data)
        }
      })
      .catch(console.error)
  }, [])

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError('请输入需要转换的文本')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
        }),
      })

      if (!response.ok) {
        throw new Error('TTS synthesis failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    }
    catch (err: any) {
      setError(err.message || '发生未知错误')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edge TTS 测试页面</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">选择声音</label>
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="zh-CN-XiaoxiaoNeural">zh-CN-XiaoxiaoNeural</option>
            <option value="zh-CN-YunxiNeural">zh-CN-YunxiNeural</option>
            <option value="zh-CN-YunjianNeural">zh-CN-YunjianNeural</option>
            <option value="en-US-AriaNeural">en-US-AriaNeural</option>
            <option value="en-US-GuyNeural">en-US-GuyNeural</option>
            {voices.map(voice => (
              !['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunjianNeural', 'en-US-AriaNeural', 'en-US-GuyNeural'].includes(voice.Name) && (
                <option key={voice.Name} value={voice.Name}>
                  {voice.FriendlyName || voice.Name}
                </option>
              )
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">输入文本</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full h-32 p-3 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            placeholder="请输入想要转换的文字..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="button"
          onClick={handleSynthesize}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '正在合成...' : '生成语音'}
        </button>

        {audioUrl && (
          <div className="mt-6 p-4 border rounded-md dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
            <h3 className="text-lg font-medium mb-3">播放结果</h3>
            <audio controls src={audioUrl} className="w-full" autoPlay>
              您的浏览器不支持 audio 标签。
            </audio>
          </div>
        )}
      </div>
    </div>
  )
}
