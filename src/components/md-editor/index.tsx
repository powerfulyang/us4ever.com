'use client'

import type { EditorProps } from '@bytemd/react'
import frontmatter from '@bytemd/plugin-frontmatter'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import { Editor } from '@bytemd/react'
import { useTheme } from 'next-themes'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'
import './editor.css'

// ByteMD 插件配置
const plugins = [
  gfm(),
  frontmatter(),
  highlight(),
  math(),
]

interface MarkdownEditorProps extends Partial<Omit<EditorProps, 'plugins' | 'value' | 'onChange'>> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 轻量级 Markdown 编辑器 - 基于 ByteMD
 * 支持 GFM、数学公式、代码高亮等
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始输入内容...',
  ...props
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`markdown-editor ${isDark ? 'dark' : 'light'}`}>
      <Editor
        value={value}
        onChange={onChange}
        plugins={plugins}
        placeholder={placeholder}
        editorConfig={{
          autofocus: true,
        }}
        {...props}
      />
    </div>
  )
}
