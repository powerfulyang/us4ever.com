'use client'

import type { FC } from 'react'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'
import { cn } from '@/utils'
import { CodeBlock } from './CodeBlock'
import styles from './markdown.module.scss'
import 'katex/dist/katex.min.css'

interface MarkdownProps {
  children: string
  className?: string
  /** 是否启用 Mermaid 图表支持 */
  enableMermaid?: boolean
}

// 自定义允许的标签
const customSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'mark'],
}

const LANGUAGE_REGEX = /language-(\w+)/
const NEWLINE_REGEX = /\n$/

/**
 * Rehype 插件：修复 <p> 包裹块级元素的问题
 * 当 <p> 包含 <div> 等块级元素时，将 <p> 拆分或提升子元素
 */
function rehypeFixParagraphs() {
  return (tree: any) => {
    const blockElements = new Set([
      'div',
      'pre',
      'code',
      'table',
      'figure',
      'blockquote',
      'ul',
      'ol',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ])

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'p' && parent) {
        // 检查是否有块级子元素
        const hasBlockChild = node.children?.some(
          (child: any) => child.type === 'element' && blockElements.has(child.tagName),
        )

        if (hasBlockChild) {
          // 将 <p> 的内容提升到父级
          parent.children.splice(index, 1, ...node.children)
          return index // 继续检查当前位置
        }
      }
    })
  }
}

/**
 * Markdown 渲染组件 - VitePress 风格
 * 支持亮暗主题切换，代码高亮使用 Shiki
 */
export const Markdown: FC<MarkdownProps> = ({ children, className }) => {
  const { resolvedTheme } = useTheme()

  const components = useMemo(() => ({
    // 代码块渲染 - pre 保持默认包裹，code 组件处理内容
    code: ({ node, inline, className: codeClassName, children: codeChildren, ...props }: any) => {
      const match = LANGUAGE_REGEX.exec(codeClassName || '')
      const language = match?.[1] || 'text'

      if (inline) {
        return (
          <code className={styles.inlineCode} {...props}>
            {codeChildren}
          </code>
        )
      }

      // 块级代码：确保不嵌套在 <p> 内
      // react-markdown 默认会生成 <pre><code> 结构
      // 我们在这里返回块级元素，让 pre 组件处理包裹
      return (
        <CodeBlock language={language}>
          {String(codeChildren).replace(NEWLINE_REGEX, '')}
        </CodeBlock>
      )
    },
    // pre 组件：替换默认的 <pre> 包裹，避免嵌套问题
    pre: ({ children }: any) => {
      // 如果 children 是 CodeBlock，直接返回它（已经是块级元素）
      // 这样可以避免 <pre><div>...</div></pre> 的冗余结构
      return <>{children}</>
    },
    // 链接
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {children}
      </a>
    ),
    // 图片
    img: ({ src, alt }: any) => (
      <figure className={styles.figure}>
        <img src={src} alt={alt} loading="lazy" />
        {alt && <figcaption>{alt}</figcaption>}
      </figure>
    ),
    // 表格
    table: ({ children }: any) => (
      <div className={styles.tableWrapper}>
        <table>{children}</table>
      </div>
    ),
  }), [])

  return (
    <div className={cn(styles.markdown, resolvedTheme === 'dark' && styles.dark, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, customSchema],
          rehypeFixParagraphs,
          rehypeKatex,
        ]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

// 兼容旧组件名
export const MdRender = Markdown
