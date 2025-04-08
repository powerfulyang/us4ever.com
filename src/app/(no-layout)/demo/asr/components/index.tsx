'use client'
import { cn } from '@/utils'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

const ASR_WS_URL = 'wss://asr.us4ever.com'

export default function ASRDemo() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const pcmNodeRef = useRef<AudioWorkletNode | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      // 获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // 创建 AudioContext，设置采样率为 16kHz
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      // 加载 AudioWorkletProcessor
      await audioContext.audioWorklet.addModule('/asr/pcm-processor.js')

      // 创建 AudioWorkletNode
      const pcmNode = new AudioWorkletNode(audioContext, 'pcm-processor')
      pcmNodeRef.current = pcmNode

      // 建立 WebSocket 连接
      const ws = new WebSocket(ASR_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket 连接已建立')
        const request = {
          chunk_size: [5, 10, 5],
          wav_name: 'h5',
          is_speaking: true,
          chunk_interval: 10,
          itn: true,
          mode: '2pass',
          wav_format: 'PCM', // 指定 PCM 格式
        }
        ws.send(JSON.stringify(request))
      }

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data)
          if (result.text && result.stamp_sents) {
            setTranscript(prev => prev + result.text)
          }
        }
        catch (error) {
          console.error('解析识别结果失败:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket 连接已关闭')
      }

      // 处理 PCM 数据并发送到 WebSocket
      pcmNode.port.onmessage = (event) => {
        const pcmBuffer = event.data // ArrayBuffer
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(pcmBuffer)
        }
      }

      // 连接音频源到 AudioWorkletNode
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(pcmNode)
      pcmNode.connect(audioContext.destination) // 可选：播放音频

      setIsRecording(true)
    }
    catch (error) {
      console.error('启动录音失败:', error)
    }
  }

  const stopRecording = () => {
    // 断开音频节点并清理资源
    if (pcmNodeRef.current) {
      pcmNodeRef.current.disconnect()
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ is_speaking: false }))
      }
      wsRef.current.close()
    }
    setIsRecording(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          语音识别
        </motion.h1>

        <div className="space-y-6">
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'px-6 py-3 rounded-lg transition-all duration-300 text-white font-medium',
                'shadow-lg hover:shadow-xl active:scale-95',
                {
                  'bg-red-500 hover:bg-red-600 ring-red-300': isRecording,
                  'bg-blue-500 hover:bg-blue-600 ring-blue-300': !isRecording,
                },
                'focus:outline-none focus:ring-4',
              )}
            >
              <span className="flex items-center space-x-2">
                {isRecording
                  ? (
                      <>
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>停止录音</span>
                      </>
                    )
                  : (
                      <>
                        <span className="w-2 h-2 bg-white rounded-full" />
                        <span>开始录音</span>
                      </>
                    )}
              </span>
            </button>
          </motion.div>

          <motion.div
            className={cn(
              'rounded-xl p-6 bg-white shadow-lg',
              'border border-gray-100',
              'transition-all duration-300',
              { 'ring-2 ring-blue-100': isRecording },
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">识别结果</h2>
            <div className="min-h-[200px] bg-gray-50 rounded-lg p-4">
              {transcript
                ? (
                    <p className="whitespace-pre-wrap text-gray-700">{transcript}</p>
                  )
                : (
                    <p className="text-gray-400 italic">等待识别结果...</p>
                  )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
