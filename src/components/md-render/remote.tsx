import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import * as React from 'react'
import rehypeKatex from 'rehype-katex'
import remarkFlexibleToc from 'remark-flexible-toc'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { LazyMermaidRender } from '@/components/md-render/lazy'
import { PrismCode } from '@/components/md-render/PrismCode'
import { cn } from '@/utils'
import styles from './markdown.module.scss'
import 'katex/dist/katex.min.css'

// 在模块级别定义正则表达式，避免每次调用重新编译
const LANGUAGE_REGEX = /language-(\w+)/

function PreComponent({ children }: any) {
  const codeNode = children
  const className = codeNode?.props?.className || ''
  const value = codeNode?.props?.children || ''

  const match = LANGUAGE_REGEX.exec(className)
  const language = match?.[1] || 'text'

  if (language === 'mermaid') {
    return (
      <pre className="mermaid flex justify-center items-center">{value}</pre>
    )
  }

  return <PrismCode language={language}>{value}</PrismCode>
}

function LinkComponent({ href, children }: any) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
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
        remarkFlexibleToc,
        remarkGfm,
        remarkMath,
      ],
      rehypePlugins: [
        rehypeKatex,
      ],
      format,
    },
    parseFrontmatter: true,
    vfileDataIntoScope: 'toc',
  }

  return (
    <div className={cn(styles.markdown, className, 'relative')}>
      {enableMermaid && <LazyMermaidRender source={source} />}
      <MDXRemote
        source={source}
        options={options}
        components={{
          pre: PreComponent,
          link: LinkComponent,
          // 表格包装
          table: ({ children }: any) => (
            <div className={styles.tableWrapper}>
              <table>{children}</table>
            </div>
          ),
          // 行内代码
          code: ({ node, inline, className: codeClassName, children: codeChildren, ...props }: any) => {
            if (inline) {
              return (
                <code className={styles.inlineCode} {...props}>
                  {codeChildren}
                </code>
              )
            }
            // 非行内代码由 PreComponent 处理
            return <code className={codeClassName} {...props}>{codeChildren}</code>
          },
        }}
      />
    </div>
  )
}
