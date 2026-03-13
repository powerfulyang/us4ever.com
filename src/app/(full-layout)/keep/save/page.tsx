import type { Metadata } from 'next'
import KeepEditor from './components/editor'

export const metadata: Metadata = {
  title: 'Keep - 新建笔记',
  description: '创建一个新笔记',
  robots: { index: false },
}

export default function SavePage() {
  return <KeepEditor />
}
