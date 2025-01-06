import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 },
      )
    }

    // 这里只是演示，实际应用中你需要处理文件上传
    // 例如保存到磁盘或上传到云存储
    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    }

    return NextResponse.json({
      message: '文件上传成功',
      file: fileInfo,
    })
  }
  catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 },
    )
  }
}
