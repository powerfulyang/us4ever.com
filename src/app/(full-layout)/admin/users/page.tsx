'use client'

import { Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { MobileRedirect } from '@/components/mobile-redirect'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { api } from '@/trpc/react'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = api.user.list.useQuery({
    page,
    pageSize: 10,
  })

  if (isError) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-destructive">权限不足</CardTitle>
          <CardDescription>只有管理员可以访问此页面</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <MobileRedirect />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">用户管理</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>
              共
              {' '}
              {data?.total ?? 0}
              {' '}
              位用户
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading
              ? (
                  <div className="space-y-3">
                    {Array.from(Array.from({ length: 5 }), (_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                          <div className="w-32 h-3 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : (
                  <>
                    <div className="space-y-2">
                      {data?.users.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.nickname} />
                            <AvatarFallback>
                              {user.nickname?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {user.nickname || '未设置昵称'}
                              </span>
                              {user.isAdmin && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  管理员
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                          {user.group && (
                            <span className="text-sm text-muted-foreground">
                              {user.group.name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {user.createdAt.toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 分页 */}
                    {data && data.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          上一页
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {page}
                          {' '}
                          /
                          {data.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                          disabled={page >= data.totalPages}
                        >
                          下一页
                        </Button>
                      </div>
                    )}
                  </>
                )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
