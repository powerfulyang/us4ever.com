'use client'

import type { FC } from 'react'
import { Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

import { Button } from '@/components/ui/button'

import styles from './code-block.module.scss'

interface CodeBlockProps {
  language: string
  children: string
}

/**
 * Shiki 代码高亮组件
 * 支持 VitePress 风格的代码块，自动切换亮暗主题
 */
export const CodeBlock: FC<CodeBlockProps> = ({ language, children }) => {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const highlight = async () => {
      try {
        const result = await codeToHtml(children, {
          lang: language,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: false,
        })
        setHtml(result)
      }
      catch {
        // 如果语言不支持，降级为纯文本
        const result = await codeToHtml(children, {
          lang: 'text',
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: false,
        })
        setHtml(result)
      }
    }
    highlight()
  }, [children, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(setCopied, 2000, false)
    }
    catch {
      console.error('复制失败')
    }
  }

  return (
    <div className={styles.codeBlock}>
      {/* 顶部工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.language}>{language}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={styles.copyBtn}
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? '已复制' : '复制'}
        </Button>
      </div>

      {/* 代码内容 */}
      <div
        className={styles.content}
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
