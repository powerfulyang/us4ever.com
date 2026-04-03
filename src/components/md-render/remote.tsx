import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import * as React from 'react'
import rehypeKatex from 'rehype-katex'
import remarkFlexibleToc from 'remark-flexible-toc'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { LazyMermaidDiagram } from '@/components/md-render/lazy'
import { PrismCode } from '@/components/md-render/PrismCode'
import { cn } from '@/utils'
import styles from './markdown.module.scss'
import 'katex/dist/katex.min.css'

// 在模块级别定义正则表达式，避免每次调用重新编译
const LANGUAGE_REGEX = /language-(\w+)/

interface Props {
  children: string
  className?: string
  enableMermaid?: boolean
  format?: 'md' | 'mdx'
}

// 生成唯一 ID 的辅助函数
function generateMermaidId() {
  return `mermaid-${Math.random().toString(36).slice(2, 9)}`
}

// 服务端组件 - 用于 MDX 远程渲染
export default function RemoteMdx({
  children: source,
  className,
  enableMermaid = true,
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

  const components = {
    pre: ({ children }: { children: React.ReactNode }) => {
      const codeNode = children as React.ReactElement
      const className = codeNode?.props?.className || ''
      const value = codeNode?.props?.children || ''

      const match = LANGUAGE_REGEX.exec(className)
      const language = match?.[1] || 'text'

      // mermaid 代码块
      if (language === 'mermaid' && enableMermaid) {
        const codeString = typeof value === 'string' ? value : String(value)
        return (
          <div className="flex justify-center items-center my-4">
            <LazyMermaidDiagram code={codeString} id={generateMermaidId()} />
          </div>
        )
      }

      return <PrismCode language={language}>{value}</PrismCode>
    },
    link: ({ href, children }: { href: string, children: React.ReactNode }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {children}
      </a>
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className={styles.tableWrapper}>
        <table>{children}</table>
      </div>
    ),
    img: ({ src, alt }: { src: string, alt: string }) => (
      // eslint-disable-next-line next/no-img-element
      <img src={src} alt={alt} loading="eager" className="inline-block max-w-full h-auto" />
    ),
    code: ({ inline, className: codeClassName, children: codeChildren, ...props }: {
      inline?: boolean
      className?: string
      children?: React.ReactNode
    }) => {
      if (inline) {
        return (
          <code className={styles.inlineCode} {...props}>
            {codeChildren}
          </code>
        )
      }
      return <code className={codeClassName} {...props}>{codeChildren}</code>
    },
  }

  return (
    <div className={cn(styles.markdown, className, 'relative')}>
      <MDXRemote
        source={source}
        options={options}
        components={components}
      />
    </div>
  )
}
