'use client'

import Editor from '@monaco-editor/react'
import { Terminal } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface MonacoEditorProps {
  data: any[] | Record<string, any[]>
  types: string
}

export default function MonacoEditor({ data }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const sampleCode = useMemo(() => {
    // 处理数据格式
    const isMultiSheet = !Array.isArray(data)
    const sampleData = Array.isArray(data)
      ? data
      : Object.values(data).flat()

    // 生成示例代码
    return `// 数据实例${isMultiSheet ? ' (合并了所有工作表)' : ''}
const jsonData = ${JSON.stringify(sampleData, null, 2)}

${isMultiSheet
  ? `
// 多工作表数据结构
const allSheets = ${JSON.stringify(data, null, 2)}

// 示例：按工作表处理数据
function processMultiSheetData() {
  Object.entries(allSheets).forEach(([sheetName, sheetData]) => {
    console.log(\`处理工作表: \${sheetName}, 数据量: \${sheetData.length}\`)
    // 在这里处理特定工作表的数据
  })
}
`
  : ''}

// 示例操作
function processData() {
  // 在这里编写你的数据处理逻辑
  // 编辑器会提供完整的类型提示和智能补全

  // 过滤数据
  const filtered = jsonData.filter((item) => {
    // 在这里添加过滤条件
    return true
  })

  // 映射数据
  const mapped = filtered.map((item) => {
    return item
  })

  // 额外处理
  const extraProcessed = JSON.stringify(mapped, null, 2)

  // 写入剪切板
  navigator.clipboard.writeText(extraProcessed)
  return extraProcessed
}

processData()`
  }, [data])
  const [editorValue, setEditorValue] = useState(() => sampleCode)
  const [isReady, setIsReady] = useState(false)

  const handleEditorDidMount = (editor: any) => {
    const editorElement = document.getElementById('monaco-editor-data-parser')
    // scroll into view
    editorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    editorRef.current = editor
    // 编辑器滚动到最底部
    editor.revealLine(editor.getModel().getLineCount())

    setIsReady(true)
  }

  const handleRunCode = () => {
    // 执行代码
    const code = editorRef.current.getValue()
    try {
      // eslint-disable-next-line no-eval
      eval(code)
    }
    catch (error) {
      toast.error(`代码执行错误，${error}`)
    }
  }

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.trigger('', 'editor.action.formatDocument')
    }
  }

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.setValue(sampleCode)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-purple-600" />
          Monaco Editor - 智能编辑器
        </h3>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleFormat}
            disabled={!isReady}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            格式化
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!isReady}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            重置
          </button>
          <button
            type="button"
            onClick={handleRunCode}
            disabled={!isReady}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            运行代码
          </button>
        </div>
      </div>

      <div id="monaco-editor-data-parser" className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          height="600px"
          defaultLanguage="javascript"
          value={editorValue}
          onChange={value => setEditorValue(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
          }}
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-800 mb-2">编辑器功能</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
          <ul className="space-y-1">
            <li>• 🎯 智能代码补全和类型提示</li>
            <li>• 🔍 实时语法检查和错误提示</li>
            <li>• 📝 自动格式化和代码美化</li>
          </ul>
          <ul className="space-y-1">
            <li>• 🚀 基于你的数据类型的精确提示</li>
            <li>• ⚡ VS Code 同款编辑体验</li>
            <li>• 🛠️ 支持 TypeScript 全部特性</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">快捷键提示</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>编辑:</strong>
            <ul className="mt-1 space-y-1">
              <li>Ctrl+Z: 撤销</li>
              <li>Ctrl+Y: 重做</li>
              <li>Ctrl+A: 全选</li>
            </ul>
          </div>
          <div>
            <strong>代码:</strong>
            <ul className="mt-1 space-y-1">
              <li>Ctrl+Space: 代码补全</li>
              <li>Alt+Shift+F: 格式化</li>
              <li>F12: 跳转定义</li>
            </ul>
          </div>
          <div>
            <strong>搜索:</strong>
            <ul className="mt-1 space-y-1">
              <li>Ctrl+F: 查找</li>
              <li>Ctrl+H: 替换</li>
              <li>Ctrl+G: 跳转行</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
