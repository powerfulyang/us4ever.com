'use client'

import { Check, Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { Prism } from 'react-syntax-highlighter'
import { atomDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui'
import { cn } from '@/utils'
import styles from './prism.module.scss'

interface Props {
  language: string
  children: string
  maxHeight?: number
  className?: string
}

// 不要 class name 的下划线，俺不喜欢
delete atomDark['class-name']?.textDecoration

export const PrismCode: React.FC<Props> = ({ language, children, maxHeight, className }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [copied, setCopied] = React.useState(false)

  const style = isDark ? atomDark : materialLight
  const backgroundColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'hsl(var(--secondary))'

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      toast('复制成功', { type: 'success' })
      setTimeout(setCopied, 2000, false)
    }
    catch {
      toast('复制失败', { type: 'error' })
    }
  }

  return (
    <div className={cn(styles.pre, className)}>
      <div data-mdast="ignore" className={styles.toolbar}>
        <div className={styles.toolbarLanguage}>{language}</div>
        <div className={styles.toolbarAction}>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 w-auto gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            onClick={onCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>
      <Prism
        showLineNumbers
        style={style}
        language={language}
        PreTag="pre"
        codeTagProps={{
          style: {
            fontFamily: `"Fira Code", "Fira Mono", "Roboto Mono", monospace`,
            fontSize: '0.9rem',
            lineHeight: '1.5',
          },
        }}
        customStyle={{
          borderRadius: 0,
          margin: 0,
          padding: '1.25rem 1rem',
          backgroundColor,
          maxHeight,
        }}
      >
        {children.trim()}
      </Prism>
    </div>
  )
}
