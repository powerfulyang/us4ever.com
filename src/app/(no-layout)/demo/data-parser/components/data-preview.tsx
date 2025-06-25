'use client'

import React, { useMemo, useState } from 'react'
import { cn } from '@/utils/cn'

interface DataPreviewProps {
  data: any[] | Record<string, any[]>
  fileName: string
  fileType: 'excel' | 'csv'
  isMultiSheet?: boolean
  sheetNames?: string[]
}

export function DataPreview({ data, fileName, fileType, isMultiSheet = false, sheetNames = [] }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  // 获取当前显示的数据
  const currentData = useMemo(() => {
    if (Array.isArray(data)) {
      return data
    }
    else if (isMultiSheet && selectedSheet && data[selectedSheet]) {
      return data[selectedSheet]
    }
    else if (isMultiSheet && sheetNames.length > 0 && !selectedSheet) {
      // 默认选择第一个工作表
      const firstSheet = sheetNames[0]
      if (firstSheet && data[firstSheet]) {
        setSelectedSheet(firstSheet)
        return data[firstSheet]
      }
    }
    return []
  }, [data, isMultiSheet, selectedSheet, sheetNames])

  // 数据统计
  const stats = useMemo(() => {
    if (!currentData || currentData.length === 0)
      return null

    const totalRows = currentData.length
    const firstRow = currentData[0]
    const columns = typeof firstRow === 'object' && firstRow !== null
      ? Object.keys(firstRow)
      : []

    // 分析数据类型
    const typeAnalysis = columns.reduce((acc, col) => {
      const values = currentData.map((row: any) => row[col]).filter((val: any) => val !== null && val !== undefined)
      const types = new Set(values.map((val: any) => typeof val))
      acc[col] = {
        totalValues: values.length,
        nullValues: totalRows - values.length,
        types: Array.from(types),
      }
      return acc
    }, {} as Record<string, any>)

    return {
      totalRows,
      totalColumns: columns.length,
      columns,
      typeAnalysis,
    }
  }, [currentData])

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return currentData.slice(startIndex, startIndex + pageSize)
  }, [currentData, currentPage, pageSize])

  const totalPages = Math.ceil(currentData.length / pageSize)

  if (!currentData || currentData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">没有数据可预览</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工作表选择器 */}
      {isMultiSheet && sheetNames.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">工作表选择</h4>
          <div className="flex flex-wrap gap-2">
            {sheetNames.map(sheetName => (
              <button
                type="button"
                key={sheetName}
                onClick={() => setSelectedSheet(sheetName)}
                className={cn(
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  {
                    'bg-blue-500 text-white': selectedSheet === sheetName,
                    'bg-white text-blue-600 hover:bg-blue-100': selectedSheet !== sheetName,
                  },
                )}
              >
                {sheetName}
              </button>
            ))}
          </div>
          {selectedSheet && (
            <p className="text-sm text-blue-600 mt-2">
              当前显示：
              <strong>{selectedSheet}</strong>
              {' '}
              工作表
            </p>
          )}
        </div>
      )}

      {/* 文件信息和统计 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          数据概览
          {' '}
          {isMultiSheet && selectedSheet && `- ${selectedSheet}`}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalRows}</div>
            <div className="text-sm text-gray-600">总行数</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats?.totalColumns}</div>
            <div className="text-sm text-gray-600">总列数</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{fileType.toUpperCase()}</div>
            <div className="text-sm text-gray-600">文件类型</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((JSON.stringify(currentData).length / 1024) * 100) / 100}
              KB
            </div>
            <div className="text-sm text-gray-600">当前数据大小</div>
          </div>
          {isMultiSheet && (
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{sheetNames.length}</div>
              <div className="text-sm text-gray-600">工作表数量</div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600">
            <strong>文件名：</strong>
            {' '}
            {fileName}
          </div>
        </div>
      </div>

      {/* 列信息 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">列信息</h4>
        <div className="grid gap-2">
          {stats?.columns.map((col, index) => {
            const analysis = stats.typeAnalysis[col]
            return (
              <div key={col} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span className="font-medium">{col}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>
                    类型:
                    {analysis.types.join(', ')}
                  </span>
                  <span>
                    有效值:
                    {analysis.totalValues}
                  </span>
                  {analysis.nullValues > 0 && (
                    <span className="text-orange-600">
                      空值:
                      {analysis.nullValues}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  #
                </th>
                {stats?.columns.map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn('hover:bg-gray-50', {
                    'bg-blue-50': index % 2 === 0,
                  })}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  {stats?.columns.map(col => (
                    <td key={col} className="px-4 py-3 text-sm text-gray-900">
                      <div className="group relative flex items-center max-w-sm">
                        <div className="truncate flex-1" title={String(row[col] || '')}>
                          {row[col] === null || row[col] === undefined
                            ? (
                                <span className="text-gray-400 italic">null</span>
                              )
                            : typeof row[col] === 'boolean'
                              ? (
                                  <span className={cn('px-2 py-1 text-xs rounded-full', {
                                    'bg-green-100 text-green-800': row[col],
                                    'bg-red-100 text-red-800': !row[col],
                                  })}
                                  >
                                    {String(row[col])}
                                  </span>
                                )
                              : typeof row[col] === 'number'
                                ? (
                                    <span className="font-mono">{row[col]}</span>
                                  )
                                : (
                                    String(row[col])
                                  )}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const cellId = `${index}-${col}`
                              await navigator.clipboard.writeText(String(row[col] || ''))
                              setCopiedCell(cellId)
                              setTimeout(() => setCopiedCell(null), 1000)
                            }
                            catch (error) {
                              console.error('复制失败:', error)
                            }
                          }}
                          className={cn(
                            'ml-2 p-1 transition-all',
                            copiedCell === `${index}-${col}`
                              ? 'opacity-100 text-green-500'
                              : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600',
                          )}
                          title="复制单元格内容"
                        >
                          {copiedCell === `${index}-${col}`
                            ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )
                            : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-sm text-gray-700 mr-2">每页显示：</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>

                <span className="text-sm text-gray-700">
                  第
                  {' '}
                  {currentPage}
                  {' '}
                  页，共
                  {' '}
                  {totalPages}
                  {' '}
                  页
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
