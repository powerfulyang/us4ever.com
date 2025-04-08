import type { Metadata } from 'next'
import ASRDemo from '@/app/(no-layout)/demo/asr/components'

// Define page metadata
export const metadata: Metadata = {
  title: 'Free Speech Recognition Demo - Using WebSocket',
  description: 'This is a free speech recognition demo using WebSocket. It allows you to record your voice and get real-time transcription results. The demo uses the Web Audio API and WebSocket to send audio data to the server for processing.',
  alternates: {
    canonical: `/demo/asr`,
  },
}

export default ASRDemo
