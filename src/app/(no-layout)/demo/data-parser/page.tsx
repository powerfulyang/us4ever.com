import type { Metadata } from 'next'
import { DataParserPage } from './components/data-parser-page'

export const metadata: Metadata = {
  title: 'Excel/CSV 数据解析器 - 生成 TypeScript 类型',
  description: '上传 Excel 或 CSV 文件，自动解析为 JSON 并生成 TypeScript 类型定义，支持 Monaco Editor 类型提示',
  alternates: {
    canonical: `/data-parser`,
  },
}

export default function DataParser() {
  return <DataParserPage />
}
