import type { Metadata } from 'next'
import { DuplexStreaming } from '@/app/demo/upload/DuplexStreaming'

// Define page metadata
export const metadata: Metadata = {
  title: 'File Upload Progress Demo - Using Fetch Duplex Streaming',
  description: 'A demonstration of file upload progress tracking using Fetch API Duplex streaming capabilities. Features real-time upload percentage display, file handling with FormData, and precise upload progress calculation through TransformStream implementation.',
}

export default function UploadDemo() {
  return <DuplexStreaming />
}
