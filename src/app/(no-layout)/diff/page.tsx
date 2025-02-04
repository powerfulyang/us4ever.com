import type { Metadata } from 'next'
import DiffPage from './components/diff-page'

export const metadata: Metadata = {
  title: 'Online Text Difference Tool',
  description: '在线文本差异对比工具，支持实时对比两段文本的差异，方便快捷。',
  keywords: ['文本对比', '差异对比', 'diff工具', '文本比较', 'online diff tool', '在线差异对比工具'],
  alternates: {
    canonical: `${BASE_URL}/diff`,
  },
}

export default function Page() {
  return <DiffPage />
}
