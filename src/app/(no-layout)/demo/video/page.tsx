import type { Metadata } from 'next'
import { VideoList } from './components/list'
import { VideoUpload } from './components/upload'

// Define page metadata
export const metadata: Metadata = {
  title: '视频上传',
  description: '管理上传的视频列表',
  alternates: {
    canonical: `/demo/video`,
  },
}

export default function VideoDemo() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <VideoUpload />
      <VideoList />
    </div>
  )
}
