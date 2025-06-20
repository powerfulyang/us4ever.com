import { Card } from '@/components/ui/card'
import { api } from '@/trpc/server'

interface KeepStatsProps {
  userId?: string
}

async function getStats(userId?: string) {
  if (!userId) {
    // 获取公开统计
    const publicKeeps = await api.keep.fetchPublicItems()
    return {
      total: publicKeeps.length,
      public: publicKeeps.length,
      private: 0,
    }
  }

  // 这里可以添加用户统计逻辑
  return {
    total: 0,
    public: 0,
    private: 0,
  }
}

// Keep 统计信息 Server Component
export async function KeepStatsServer({ userId }: KeepStatsProps) {
  // 在服务器端获取统计数据
  const stats = await getStats(userId)

  return (
    <Card>
      <div className="grid grid-cols-3 gap-4 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
          <div className="text-sm text-gray-400">总计</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.public}</div>
          <div className="text-sm text-gray-400">公开</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.private}</div>
          <div className="text-sm text-gray-400">私密</div>
        </div>
      </div>
    </Card>
  )
}
