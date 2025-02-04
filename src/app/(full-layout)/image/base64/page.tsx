import type { Metadata } from 'next'
import { Base64Converter } from '@/app/(full-layout)/image/components/base64-converter'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Image Base64 Converter',
  description: 'Convert image to base64 string',
  alternates: {
    canonical: `${BASE_URL}/image/base64`,
  },
}

export default function Base64Page() {
  return (
    <Container
      title="图片转 Base64"
      description="将图片转换为 base64 编码的字符串"
    >
      <Base64Converter />
    </Container>
  )
}
