'use client'

import { VideoList } from './components/list'
import { VideoUpload } from './components/upload'

export default function VideoDemo() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <VideoUpload />
      <VideoList />
    </div>
  )
}
