'use client'

import type { ParsedData } from './data-parser-page'
import Papa from 'papaparse'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { cn } from '@/utils/cn'
import { generateTypeScript } from '../utils/type-generator'

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  onParsedData: (data: ParsedData) => void
  isLoading: boolean
}

export function FileUploader({ onFileUpload, onParsedData, isLoading }: FileUploaderProps) {
  const [parseError, setParseError] = useState<string | null>(null)

  const parseExcelFile = useCallback(async (file: File): Promise<{ data: any[] | Record<string, any[]>, isMultiSheet: boolean, sheetNames: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('Excel 文件中没有找到工作表')
          }

          // 获取所有工作表的数据
          const allSheetsData: Record<string, any[]> = {}
          const sheetNames: string[] = []

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            if (worksheet) {
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                raw: false, // 保持格式化
                defval: '', // 空值默认为空字符串
              })

              if (jsonData.length > 0) {
                allSheetsData[sheetName] = jsonData
                sheetNames.push(sheetName)
              }
            }
          })

          if (sheetNames.length === 0) {
            throw new Error('所有工作表都没有有效数据')
          }

          // 如果只有一个工作表，返回数组格式
          if (sheetNames.length === 1) {
            const firstSheetName = sheetNames[0]
            const firstSheetData = firstSheetName ? allSheetsData[firstSheetName] : []
            resolve({
              data: firstSheetData || [],
              isMultiSheet: false,
              sheetNames,
            })
          }
          else {
            // 多个工作表，返回对象格式
            resolve({
              data: allSheetsData,
              isMultiSheet: true,
              sheetNames,
            })
          }
        }
        catch (error: any) {
          reject(new Error(`Excel 文件解析失败: ${error.message}`))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const parseCSVFile = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, // 第一行作为表头
        skipEmptyLines: true,
        transform: (value: string) => {
          // 尝试转换数据类型
          if (value === '')
            return null

          // 尝试转换为数字
          const num = Number(value)
          if (!Number.isNaN(num) && Number.isFinite(num)) {
            return num
          }

          // 尝试转换为布尔值
          if (value.toLowerCase() === 'true')
            return true
          if (value.toLowerCase() === 'false')
            return false

          // 尝试转换为日期
          const date = new Date(value)
          if (!Number.isNaN(date.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
            return date.toISOString()
          }

          return value
        },
        complete: (results: any) => {
          if (results.errors && results.errors.length > 0) {
            reject(new Error(`CSV 解析错误: ${results.errors[0].message}`))
          }
          else {
            resolve(results.data)
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV 文件解析失败: ${error.message}`))
        },
      })
    })
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setParseError(null)
    onFileUpload(file)

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let jsonData: any[] | Record<string, any[]>
      let fileType: 'excel' | 'csv'
      let isMultiSheet = false
      let sheetNames: string[] = []

      if (['xlsx', 'xls', 'xlsm'].includes(fileExtension || '')) {
        const excelResult = await parseExcelFile(file)
        jsonData = excelResult.data
        isMultiSheet = excelResult.isMultiSheet
        sheetNames = excelResult.sheetNames
        fileType = 'excel'
      }
      else if (['csv', 'txt'].includes(fileExtension || '')) {
        const csvData = await parseCSVFile(file)
        jsonData = csvData
        fileType = 'csv'
      }
      else {
        throw new Error('不支持的文件格式。请上传 Excel (.xlsx, .xls) 或 CSV 文件。')
      }

      if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)
        || (!Array.isArray(jsonData) && Object.keys(jsonData).length === 0)) {
        throw new Error('文件中没有找到有效数据')
      }

      // 生成 TypeScript 类型 - 对于多工作表，生成所有工作表的类型
      const types = Array.isArray(jsonData)
        ? generateTypeScript(jsonData, file.name)
        : generateTypeScript(Object.values(jsonData).flat(), file.name, sheetNames)

      const parsedData: ParsedData = {
        json: jsonData,
        types,
        fileName: file.name,
        fileType,
        isMultiSheet,
        sheetNames,
      }

      onParsedData(parsedData)
    }
    catch (error: any) {
      console.error('文件处理失败:', error)
      setParseError(error.message)
    }
  }, [onFileUpload, onParsedData, parseExcelFile, parseCSVFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file) {
          handleFile(file)
        }
      }
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    disabled: isLoading,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          {
            'border-blue-400 bg-blue-50': isDragActive,
            'border-gray-300 hover:border-gray-400': !isDragActive && !isLoading,
            'border-gray-200 bg-gray-50 cursor-not-allowed': isLoading,
          },
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {isLoading
            ? (
                <>
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-600 mb-2">正在解析文件...</p>
                  <p className="text-sm text-gray-500">请稍候</p>
                </>
              )
            : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    {isDragActive ? '松开以上传文件' : '拖拽文件到此处或点击上传'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    支持 Excel (.xlsx, .xls) 和 CSV 文件
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    选择文件
                  </button>
                </>
              )}
        </div>
      </div>

      {parseError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">解析错误</h3>
              <p className="text-sm text-red-700 mt-1">{parseError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
