'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useMemo, useState } from 'react'
import GitHubCorner from '@/components/GitHubCorner'
import { cn } from '@/utils/cn'
import { DataPreview } from './data-preview'
import { FileUploader } from './file-uploader'
import { TypeDisplay } from './type-display'

// 动态导入 Monaco Editor 以避免 SSR 问题
const MonacoEditor = dynamic(() => import('./monaco-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-500">加载编辑器中...</div>
    </div>
  ),
})

export interface ParsedData {
  json: any[] | Record<string, any[]> // 支持单个数组或多个工作表的对象
  types: string
  fileName: string
  fileType: 'excel' | 'csv'
  isMultiSheet?: boolean // 标识是否为多工作表
  sheetNames?: string[] // 工作表名称列表
}

export function DataParserPage() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'types' | 'editor'>('preview')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = useCallback(async (_file: File) => {
    setIsLoading(true)
    try {
      // 这里会在 FileUploader 组件中处理文件解析
      // 暂时设置为 null，等待实际解析结果
    }
    catch (error) {
      console.error('文件解析失败:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  const handleParsedDataUpdate = useCallback((data: ParsedData) => {
    setParsedData(data)
    setActiveTab('preview')
  }, [])

  const tabItems = useMemo(() => [
    { key: 'preview', label: '数据预览', disabled: !parsedData },
    { key: 'types', label: 'TypeScript 类型', disabled: !parsedData },
    { key: 'editor', label: 'Monaco 编辑器', disabled: !parsedData },
  ], [parsedData])

  return (
    <div className="min-h-screen bg-gray-50">
      <GitHubCorner repoUrl={__REPOSITORY_FILE_PATH__} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 头部标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Excel/CSV 数据解析器
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              上传 Excel 或 CSV 文件，自动解析为 JSON 并生成 TypeScript 类型定义。
              使用 Monaco Editor 获得完整的类型提示和智能补全。
            </p>
          </div>

          {/* 文件上传区域 */}
          <div className="mb-8">
            <FileUploader
              onFileUpload={handleFileUpload}
              onParsedData={handleParsedDataUpdate}
              isLoading={isLoading}
            />
          </div>

          {/* 结果展示区域 */}
          {parsedData && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 标签页头部 */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabItems.map(tab => (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => !tab.disabled && setActiveTab(tab.key as any)}
                      disabled={tab.disabled}
                      className={cn(
                        'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                        {
                          'border-blue-500 text-blue-600': activeTab === tab.key && !tab.disabled,
                          'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                            activeTab !== tab.key && !tab.disabled,
                          'border-transparent text-gray-300 cursor-not-allowed': tab.disabled,
                        },
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 标签页内容 */}
              <div className="p-6">
                {activeTab === 'preview' && (
                  <DataPreview
                    data={parsedData.json}
                    fileName={parsedData.fileName}
                    fileType={parsedData.fileType}
                    isMultiSheet={parsedData.isMultiSheet}
                    sheetNames={parsedData.sheetNames}
                  />
                )}

                {activeTab === 'types' && (
                  <TypeDisplay types={parsedData.types} />
                )}

                {activeTab === 'editor' && (
                  <MonacoEditor
                    data={parsedData.json}
                    types={parsedData.types}
                  />
                )}
              </div>
            </div>
          )}

          {/* 功能说明 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">多格式支持</h3>
              <p className="text-gray-600">支持 Excel (.xlsx, .xls) 和 CSV 文件解析，自动识别文件格式并进行相应处理。</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">智能类型推断</h3>
              <p className="text-gray-600">自动分析数据结构，生成准确的 TypeScript 类型定义，支持嵌套对象和数组。</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Monaco 编辑器</h3>
              <p className="text-gray-600">集成 VS Code 同款编辑器，提供完整的类型提示、智能补全和语法高亮。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
