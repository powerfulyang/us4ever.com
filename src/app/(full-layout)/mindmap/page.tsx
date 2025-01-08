'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/trpc/client'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MindMapPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const { data: mindmaps, isLoading } = api.mindmap.list.useQuery()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.xmind')) {
        toast({
          title: '错误',
          description: '请上传 .xmind 文件',
          variant: 'destructive',
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file)
      return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/mindmap/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok)
        throw new Error('上传失败')

      const data = await response.json()
      toast({
        title: '成功',
        description: '文件上传成功',
      })
      router.refresh()
      setFile(null)
    }
    catch (error) {
      toast({
        title: '错误',
        description: '上传失败，请重试',
        variant: 'destructive',
      })
    }
    finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>上传思维导图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="xmind">选择 XMind 文件</Label>
              <Input
                id="xmind"
                type="file"
                accept=".xmind"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? '上传中...' : '上传'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? (
            <div className="col-span-full flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )
          : mindmaps?.length === 0
            ? (
              <div className="col-span-full text-center text-muted-foreground">
                暂无思维导图
              </div>
            )
            : (
              mindmaps?.map(mindmap => (
                <Card key={mindmap.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{mindmap.title || '未命名'}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-muted-foreground">
                      创建于
                      {' '}
                      {new Date(mindmap.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm">
                        浏览:
                        {mindmap.views}
                      </span>
                      <span className="text-sm">
                        点赞:
                        {mindmap.likes}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/mindmap/${mindmap.id}`)}
                    >
                      查看
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
      </div>
    </div>
  )
}
