/**
 * TypeScript 类型生成器
 * 根据 JSON 数据自动推断并生成 TypeScript 类型定义
 */

interface TypeInfo {
  type: string
  optional: boolean
  nullable: boolean
}

/**
 * 获取值的 TypeScript 类型
 */
function getTypeOfValue(value: any): string {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (typeof value === 'string') {
    // 检查是否是日期字符串
    const date = new Date(value)
    if (!Number.isNaN(date.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
      return 'string' // 保持为 string，但可以添加注释说明是日期
    }
    return 'string'
  }

  if (typeof value === 'number') {
    return 'number'
  }

  if (typeof value === 'boolean') {
    return 'boolean'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'any[]'
    }

    // 分析数组元素类型
    const elementTypes = new Set<string>()
    value.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        elementTypes.add('object')
      }
      else {
        elementTypes.add(getTypeOfValue(item))
      }
    })

    if (elementTypes.size === 1) {
      const type = Array.from(elementTypes)[0]
      if (type === 'object') {
        // 递归处理对象数组
        return 'object[]' // 简化处理，实际应该递归生成对象类型
      }
      return `${type}[]`
    }
    else {
      return `(${Array.from(elementTypes).join(' | ')})[]`
    }
  }

  if (typeof value === 'object') {
    return 'object'
  }

  return 'any'
}

/**
 * 分析对象的属性类型信息
 */
function analyzeObjectProperties(objects: any[]): Record<string, TypeInfo> {
  const propertyTypes: Record<string, Set<string>> = {}
  const propertyOccurrence: Record<string, number> = {}

  // 收集所有属性和其类型
  objects.forEach((obj) => {
    if (typeof obj !== 'object' || obj === null)
      return

    Object.keys(obj).forEach((key) => {
      if (!propertyTypes[key]) {
        propertyTypes[key] = new Set()
        propertyOccurrence[key] = 0
      }

      const currentCount = propertyOccurrence[key] ?? 0
      propertyOccurrence[key] = currentCount + 1
      const type = getTypeOfValue(obj[key])
      propertyTypes[key].add(type)
    })
  })

  // 生成最终的类型信息
  const result: Record<string, TypeInfo> = {}

  Object.keys(propertyTypes).forEach((key) => {
    const typeSet = propertyTypes[key]
    const occurrence = propertyOccurrence[key]

    if (!typeSet || occurrence === undefined)
      return

    const types = Array.from(typeSet)
    const isOptional = occurrence < objects.length
    const hasNull = types.includes('null')

    // 过滤掉 null 类型，单独处理
    const nonNullTypes = types.filter(t => t !== 'null')

    let finalType: string
    if (nonNullTypes.length === 0) {
      finalType = 'null'
    }
    else if (nonNullTypes.length === 1) {
      finalType = nonNullTypes[0] ?? 'any'
    }
    else {
      finalType = nonNullTypes.join(' | ')
    }

    result[key] = {
      type: finalType,
      optional: isOptional,
      nullable: hasNull && nonNullTypes.length > 0,
    }
  })

  return result
}

/**
 * 生成接口定义
 */
function generateInterface(name: string, properties: Record<string, TypeInfo>): string {
  const lines = [`export interface ${name} {`]

  Object.entries(properties).forEach(([key, typeInfo]) => {
    const { type, optional, nullable } = typeInfo
    const optionalMark = optional ? '?' : ''
    const finalType = nullable ? `${type} | null` : type

    // 添加属性注释（如果需要）
    if (type === 'string' && key.toLowerCase().includes('date')) {
      lines.push(`  // 注意：${key} 可能是日期字符串`)
    }

    lines.push(`  ${key}${optionalMark}: ${finalType}`)
  })

  lines.push('}')
  return lines.join('\n')
}

/**
 * 将文件名转换为合法的 TypeScript 接口名
 */
function sanitizeInterfaceName(fileName: string): string {
  // 移除文件扩展名
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

  // 转换为 PascalCase
  const pascalCase = nameWithoutExt
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  // 确保以字母开头
  const safeName = pascalCase.match(/^[a-z]/i) ? pascalCase : `Data`

  return `${safeName}Item`
}

/**
 * 生成完整的 TypeScript 类型定义
 */
export function generateTypeScript(data: any[], fileName: string, sheetNames?: string[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '// 无法生成类型：数据为空或格式不正确'
  }

  const interfaceName = sanitizeInterfaceName(fileName)
  const properties = analyzeObjectProperties(data)

  if (Object.keys(properties).length === 0) {
    return `// 无法生成类型：未找到有效的对象属性
export type ${interfaceName} = any`
  }

  const interfaceDefinition = generateInterface(interfaceName, properties)

  // 生成数组类型别名
  const arrayTypeName = interfaceName.replace('Item', 'Array')

  // 如果有多个工作表名称，生成工作表相关的类型
  let sheetTypesDefinition = ''
  if (sheetNames && sheetNames.length > 1) {
    const sheetInterfaceName = interfaceName.replace('Item', 'Sheets')
    sheetTypesDefinition = `

// 工作表类型定义
export interface ${sheetInterfaceName} {
${sheetNames.map(name => `  "${name}": ${arrayTypeName}`).join('\n')}
}

// 工作表名称枚举
export type SheetNames = ${sheetNames.map(name => `"${name}"`).join(' | ')}`
  }

  return `${interfaceDefinition}

// 数组类型别名
export type ${arrayTypeName} = ${interfaceName}[]${sheetTypesDefinition}

// 使用示例：
// const data: ${arrayTypeName} = [
//   // 你的数据...
// ]
//
// 单个项目类型：
// const item: ${interfaceName} = data[0]

// 数据统计
// 总记录数：${data.length}
// 字段数：${Object.keys(properties).length}
// 可选字段：${Object.values(properties).filter(p => p.optional).length}
// 可空字段：${Object.values(properties).filter(p => p.nullable).length}`
}

/**
 * 生成 Monaco Editor 的类型声明
 */
export function generateMonacoTypes(data: any[], fileName: string): string {
  const baseTypes = generateTypeScript(data, fileName)

  // 添加全局声明，使 Monaco Editor 能够识别类型
  const interfaceName = sanitizeInterfaceName(fileName)
  const arrayTypeName = interfaceName.replace('Item', 'Array')

  return `${baseTypes}

// 全局类型声明（用于 Monaco Editor）
declare global {
  interface Window {
    ${interfaceName}: typeof ${interfaceName}
    ${arrayTypeName}: typeof ${arrayTypeName}
  }
}

// 数据实例
const data: ${arrayTypeName} = ${JSON.stringify(data, null, 2)}`
}
