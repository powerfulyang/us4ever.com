import { api } from '@/trpc/react'

export function VideoList() {
  const { data, isPending } = api.asset.list_video.useQuery()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!data?.length) {
    return <div>No videos found</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded">
      {data.map(video => (
        <video key={video.id} controls src={video.url} className="aspect-square object-cover rounded-lg" />
      ))}
    </div>
  )
}
