'use client'

import { Code } from 'lucide-react'
import React from 'react'
import { PrismCode } from '@/components/md-render/PrismCode'

interface TypeDisplayProps {
  types: string
}

export function TypeDisplay({ types }: TypeDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-600" />
          TypeScript 类型定义
        </h3>
      </div>

      <div className="rounded-lg overflow-hidden">
        <PrismCode language="typescript" maxHeight={600}>
          {types}
        </PrismCode>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">使用说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 复制上面的类型定义到你的 TypeScript 项目中</li>
          <li>• 使用接口类型来确保类型安全</li>
          <li>• 数组类型别名可以用于批量数据处理</li>
          <li>• 可选字段标记为 ? 符号，表示该字段可能不存在</li>
          <li>• 可空字段使用联合类型 | null 表示</li>
        </ul>
      </div>
    </div>
  )
}
