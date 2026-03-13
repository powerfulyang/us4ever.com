'use client'

import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor'
import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor'
import { useTheme } from 'next-themes'
import * as React from 'react'
import '@mdxeditor/editor/style.css'
import './editor.css'

interface MarkdownEditorProps extends Omit<MDXEditorProps, 'markdown'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * MDX Editor 组件 - 基于 Lexical 内核
 * 支持完整的 Markdown 编辑功能
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始输入内容...',
  ...props
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const editorRef = React.useRef<MDXEditorMethods>(null)

  // 根据主题动态切换编辑器样式
  React.useEffect(() => {
    const editorRoot = document.querySelector('.mdxeditor')
    if (editorRoot) {
      if (isDark) {
        editorRoot.classList.add('dark-theme')
        editorRoot.classList.remove('light-theme')
      }
      else {
        editorRoot.classList.add('light-theme')
        editorRoot.classList.remove('dark-theme')
      }
    }
  }, [isDark])

  return (
    <div className={`markdown-editor h-full ${isDark ? 'dark' : 'light'}`}>
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          // 基础编辑功能
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),

          // 链接和图片
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageAutocompleteSuggestions: [],
          }),

          // 表格
          tablePlugin(),

          // 代码块
          codeBlockPlugin({ defaultCodeBlockLanguage: 'text' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              ts: 'TypeScript',
              jsx: 'JSX',
              tsx: 'TSX',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              python: 'Python',
              java: 'Java',
              go: 'Go',
              rust: 'Rust',
              sql: 'SQL',
              shell: 'Shell',
              yaml: 'YAML',
              md: 'Markdown',
              text: 'Plain Text',
            },
          }),

          // Frontmatter
          frontmatterPlugin(),

          // 工具栏
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <div className="w-px h-6 bg-border mx-1" />
                <BoldItalicUnderlineToggles />
                <div className="w-px h-6 bg-border mx-1" />
                <ListsToggle />
                <div className="w-px h-6 bg-border mx-1" />
              </>
            ),
          }),

          // Markdown 快捷键
          markdownShortcutPlugin(),
        ]}
        {...props}
      />
    </div>
  )
}

// 导出编辑器引用方法供外部使用
export type { MDXEditorMethods }
