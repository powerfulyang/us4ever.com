import type { Metadata } from 'next'
import { Excalidraw } from './components/draw-page'

export const metadata: Metadata = {
  title: 'Whiteboard',
  description: '在线白板',
  alternates: {
    canonical: `${BASE_URL}/draw`,
  },
}

export default function App() {
  return (
    <div className="w-full h-full">
      <Excalidraw />
    </div>
  )
}
