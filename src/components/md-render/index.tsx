'use client'

import type { ExtraProps } from 'react-markdown'
import { PrismCode } from '@/components/md-render/PrismCode'
import { cn } from '@/utils'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import styles from './index.module.scss'
import 'katex/dist/katex.min.css'

export function Pre({ node }: React.ClassAttributes<HTMLPreElement> & React.HTMLAttributes<HTMLPreElement> & ExtraProps) {
  if (node && node.tagName === 'pre' && node.children[0] && node.children[0].type === 'element') {
    const codeNode = node.children[0]
    const className = codeNode?.properties.className as [string] || undefined
    const { value } = (codeNode?.children?.[0] || {}) as { value: string }

    const match = /language-(\w+)/.exec(className?.[0] || '')
    const language = match?.[1] || 'js'

    return <PrismCode language={language}>{value}</PrismCode>
  }
  return <span className="bg-red-600">Error Render Code Block</span>
}

interface LinkProps {
  href?: string
  children?: React.ReactNode
}

function Link({ href, children }: LinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

interface Props {
  children: string
  className?: string
}

export function MdRender({ children, className }: Props) {
  return (
    <ReactMarkdown
      className={cn(styles.markdownBody, className)}
      remarkPlugins={[
        remarkGfm,
        remarkMath,
      ]}
      rehypePlugins={[
        rehypeKatex,
      ]}
      components={{
        pre: Pre,
        a: Link,
      }}
    >
      {children.trim()}
    </ReactMarkdown>
  )
}
