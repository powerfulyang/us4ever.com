import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import React from 'react'
import rehypeKatex from 'rehype-katex'
import remarkFlexibleToc from 'remark-flexible-toc'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import styles from '@/components/md-render/index.module.scss'
import { LazyMermaidRender } from '@/components/md-render/lazy'
import { PrismCode } from '@/components/md-render/PrismCode'
import { cn } from '@/utils'
import 'katex/dist/katex.min.css'

function PreComponent({ children }: any) {
  const codeNode = children
  const className = codeNode?.props?.className || ''
  const value = codeNode?.props?.children || ''

  const match = /language-(\w+)/.exec(className)
  const language = match?.[1] || 'js'

  if (language === 'mermaid') {
    return (
      <pre className="mermaid flex justify-center items-center">{value}</pre>
    )
  }

  return <PrismCode language={language}>{value}</PrismCode>
}

function LinkComponent({ href, children }: any) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

interface Props {
  children: string
  className?: string
  enableMermaid?: boolean
  format?: 'md' | 'mdx'
}

export default function RemoteMdx({
  children: source,
  className,
  enableMermaid,
  format = 'md',
}: Props) {
  const options: MDXRemoteOptions = {
    mdxOptions: {
      remarkPlugins: [
        // ...
        remarkFlexibleToc, // <---------
        remarkGfm,
        remarkMath,
      ],
      rehypePlugins: [
        rehypeKatex,
        // rehypeSanitize, // 清理不合法的 HTML
        // rehypeStringify, // 转换为字符串
      ],
      format,
    },
    parseFrontmatter: true,
    vfileDataIntoScope: 'toc', // <---------
  }

  return (
    <div className={cn(styles.markdownBody, className, 'relative')}>
      {enableMermaid && <LazyMermaidRender source={source} />}
      <MDXRemote
        source={source}
        options={options}
        components={{
          pre: PreComponent,
          link: LinkComponent,
        }}
      />
    </div>
  )
}
