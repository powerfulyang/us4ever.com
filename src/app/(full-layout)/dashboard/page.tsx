import type { Metadata } from 'next'
import { range } from 'lodash-es'
import { Suspense } from 'react'
import { KeepStatsServer } from '@/app/(full-layout)/keep/components/keep-stats-server'
import { TodoStatsServer } from '@/app/(full-layout)/todo/components/todo-stats-server'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/server/db'

export const metadata: Metadata = {
  title: '仪表板',
  description: '数据概览和统计信息',
  alternates: {
    canonical: `/dashboard`,
  },
}

// 多个 Server Components 组合的仪表板
export default function DashboardPage() {
  return (
    <Container
      title="数据仪表板"
      description="查看您的数据统计和概览"
    >
      <div className="space-y-5">
        {/* Keep 统计 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">笔记统计</h2>
          <Suspense fallback={<KeepStatsSkeleton />}>
            <KeepStatsServer />
          </Suspense>
        </section>

        {/* Todo 统计 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">待办事项统计</h2>
          <Suspense fallback={<TodoStatsSkeleton />}>
            <TodoStatsServer showDetails={true} />
          </Suspense>
        </section>

        {/* 系统状态 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">系统状态</h2>
          <Suspense fallback={<SystemStatusSkeleton />}>
            <SystemStatusServer />
          </Suspense>
        </section>
      </div>
    </Container>
  )
}

function KeepStatsSkeleton() {
  return (
    <Card>
      <div className="grid grid-cols-3 gap-4 rounded-lg">
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-12 mx-auto" />
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-12 mx-auto" />
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-12 mx-auto" />
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
      </div>
    </Card>
  )
}

function TodoStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {range(4).map(_ => (
        <Card key={_} className="p-4 space-y-2">
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-4 w-16" />
        </Card>
      ))}
    </div>
  )
}

function SystemStatusSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {range(4).map(_ => (
        <Card key={_} className="p-4 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-12" />
        </Card>
      ))}
    </div>
  )
}

async function getHealthData() {
  const memUsage = process.memoryUsage()

  let status = 'healthy'

  // check database
  const database = await db.$queryRaw`SELECT 1`
  if (!database) {
    status = 'unhealthy'
  }

  return {
    memUsage,
    status,
  }
}

function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

// 系统状态 Server Component
async function SystemStatusServer() {
  const healthData = await getHealthData()

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const uptime = process.uptime()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">运行时间</div>
        <div className="text-lg font-semibold text-green-400">
          {formatUptime(uptime)}
        </div>
      </Card>

      <Card className="rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">内存使用</div>
        <div className="text-lg font-semibold text-blue-400">
          {formatBytes(healthData.memUsage.heapUsed)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          总计:
          {formatBytes(healthData.memUsage.heapTotal)}
        </div>
      </Card>

      <Card className="rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">外部内存</div>
        <div className="text-lg font-semibold text-purple-400">
          {formatBytes(healthData.memUsage.external)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          RSS:
          {formatBytes(healthData.memUsage.rss)}
        </div>
      </Card>

      <Card className="rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">系统状态</div>
        <div className={`text-lg font-semibold ${healthData.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
          {healthData.status === 'healthy' ? '健康' : '异常'}
        </div>
      </Card>
    </div>
  )
}
