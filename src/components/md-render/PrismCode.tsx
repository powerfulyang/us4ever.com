'use client'

import type { FC } from 'react'
import { useTheme } from 'next-themes'
import { Prism } from 'react-syntax-highlighter'
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'react-toastify'
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

export const PrismCode: FC<Props> = ({ language, children, maxHeight, className }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const style = isDark ? atomDark : oneLight
  const backgroundColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'hsl(var(--secondary))'

  return (
    <div className={cn(styles.pre, className)}>
      <div data-mdast="ignore" className={styles.toolbar}>
        <div className={styles.toolbarLanguage}>{language}</div>
        <div className={styles.toolbarAction}>
          <button
            type="button"
            className="pointer"
            onClick={async (e) => {
              e.preventDefault()
              try {
                await navigator.clipboard.writeText(children)
                toast('复制成功', {
                  type: 'success',
                })
              }
              catch {
                toast('复制失败', {
                  type: 'error',
                })
              }
            }}
          >
            Copy Code
          </button>
        </div>
      </div>
      <Prism
        showLineNumbers
        style={style}
        language={language}
        PreTag="pre"
        codeTagProps={{
          style: { fontFamily: `Fira Code, sans-serif` },
        }}
        customStyle={{
          borderRadius: 0,
          margin: 0,
          backgroundColor,
          maxHeight,
        }}
      >
        {children.trim()}
      </Prism>
    </div>
  )
}
