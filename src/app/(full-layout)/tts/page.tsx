'use client'

import React, { useEffect, useMemo, useState } from 'react'

export default function TTSPage() {
  const [text, setText] = useState('Hello, world! 这是一个基于 edge-tts-universal 的测试文本。')
  const [voices, setVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState('zh-CN-XiaoxiaoNeural')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 获取全部可用声音列表
    fetch('/api/tts/voices')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVoices(data)
        }
      })
      .catch(console.error)
  }, [])

  // 按照 Locale 分组，并将 中文（zh-开头）和英文（en-开头）排在最前面
  const groupedVoices = useMemo(() => {
    const groups: Record<string, any[]> = {}
    voices.forEach((voice) => {
      const locale = voice.Locale || 'Unknown'
      if (!groups[locale]) {
        groups[locale] = []
      }
      groups[locale].push(voice)
    })

    const sortedLocales = Object.keys(groups).sort((a, b) => {
      if (a.startsWith('zh') && !b.startsWith('zh'))
        return -1
      if (!a.startsWith('zh') && b.startsWith('zh'))
        return 1
      if (a.startsWith('en') && !b.startsWith('en'))
        return -1
      if (!a.startsWith('en') && b.startsWith('en'))
        return 1
      return a.localeCompare(b)
    })

    return sortedLocales.map(locale => ({
      locale,
      voices: groups[locale],
    }))
  }, [voices])

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8 transition-all">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-purple-400">
            Edge TTS 测试页面
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            高质量文本转语音在线合成工具
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
              声音模型
            </label>
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                className="w-full p-3.5 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none text-gray-800 dark:text-zinc-200 shadow-sm"
              >
                {groupedVoices.length === 0
                  ? (
                      <>
                        <option value="zh-CN-XiaoxiaoNeural">zh-CN-XiaoxiaoNeural</option>
                        <option value="zh-CN-YunxiNeural">zh-CN-YunxiNeural</option>
                        <option value="zh-CN-YunjianNeural">zh-CN-YunjianNeural</option>
                        <option value="en-US-AriaNeural">en-US-AriaNeural</option>
                        <option value="en-US-GuyNeural">en-US-GuyNeural</option>
                      </>
                    )
                  : (
                      groupedVoices.map(group => (
                        <optgroup key={group.locale} label={group.locale}>
                          {group.voices.map(voice => (
                            <option key={voice.ShortName || voice.Name} value={voice.ShortName || voice.Name}>
                              {voice.FriendlyName || voice.ShortName || voice.Name}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300">
              输入文本
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-40 p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-800 dark:text-zinc-200 shadow-sm"
              placeholder="请输入想要转换的文字..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading
              ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在合成中...
                  </>
                )
              : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    生成语音
                  </>
                )}
          </button>

          {audioUrl && (
            <div className="mt-8 p-5 sm:p-6 border border-green-200 dark:border-green-900/30 rounded-2xl bg-green-50/50 dark:bg-green-900/10 transition-all shadow-inner">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex flex-shrink-0 items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">合成结果</h3>
              </div>
              <audio controls src={audioUrl} className="w-full rounded-xl outline-none" autoPlay>
                您的浏览器不支持 audio 标签。
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
