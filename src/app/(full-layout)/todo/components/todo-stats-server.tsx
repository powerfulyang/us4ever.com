import { Card } from '@/components/ui/card'
import { PerformanceMonitor } from '@/lib/monitoring'
import { api } from '@/trpc/server'

interface TodoStatsProps {
  showDetails?: boolean
}

export async function TodoStatsServer({ showDetails = false }: TodoStatsProps) {
  const todos = await PerformanceMonitor.measureAsync('todo-stats-server', async () => {
    const result = await api.todo.fetchByCursor({})
    return result.items
  })

  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.status).length,
    pending: todos.filter(todo => !todo.status).length,
    pinned: todos.filter(todo => todo.pinned).length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  if (!showDetails) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">待办统计</h3>
          <div className="text-sm text-gray-400">
            完成率
            {completionRate}
            %
          </div>
        </div>
        <div className="mt-2 flex gap-4">
          <span className="text-sm text-gray-400">
            总计
            <span className="text-white font-medium">{stats.total}</span>
          </span>
          <span className="text-sm text-gray-400">
            待完成
            <span className="text-yellow-400 font-medium">{stats.pending}</span>
          </span>
          <span className="text-sm text-gray-400">
            已完成
            <span className="text-green-400 font-medium">{stats.completed}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <div className="text-3xl font-bold text-purple-400 mb-2">{stats.total}</div>
        <div className="text-sm text-gray-400">总任务</div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
        <div className="text-sm text-gray-400">待完成</div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-green-400 mb-2">{stats.completed}</div>
        <div className="text-sm text-gray-400">已完成</div>
      </Card>

      <Card>
        <div className="text-3xl font-bold text-blue-400 mb-2">{stats.pinned}</div>
        <div className="text-sm text-gray-400">置顶</div>
      </Card>
    </div>
  )
}
