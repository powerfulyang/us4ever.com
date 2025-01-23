import type { Metadata } from 'next'
import { Base64Converter } from '@/components/image/base64-converter'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: 'Image Base64 Converter',
  description: 'Convert image to base64 string',
}

export default function Base64Page() {
  return (
    <Container title="图片转base64" description="Convert image to base64 string">
      <Base64Converter />
    </Container>
  )
}
