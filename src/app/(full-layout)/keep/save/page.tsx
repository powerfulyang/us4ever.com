import type { Metadata } from 'next'
import KeepEditor from './components/editor'

export const metadata: Metadata = {
  title: 'Keep - Create',
  description: 'Create a new keep',
  robots: { index: false },
}

export default function SavePage() {
  return <KeepEditor />
}
