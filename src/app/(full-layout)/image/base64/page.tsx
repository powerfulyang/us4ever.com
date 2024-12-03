import type { Metadata } from 'next'
import { Base64Converter } from '@/components/image/base64-converter'

export const metadata: Metadata = {
  title: 'Image Base64 Converter',
  description: 'Convert image to base64 string',
}

export default function Base64Page() {
  return (
    <div className="max-w-4xl mx-auto">
      <Base64Converter />
    </div>
  )
}
