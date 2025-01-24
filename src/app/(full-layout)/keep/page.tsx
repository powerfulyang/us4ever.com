import type { Metadata } from 'next'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { KeepList } from '@/components/keep/list'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Keep',
  description: 'A place to record inspiration and thinking',
}

export default async function KeepPage() {
  await api.keep.list.prefetch()
  return (
    <HydrateClient>
      <Container
        title="我的笔记本"
        description="记录灵感与思考的地方"
        rightContent={(
          <AuthenticatedOnly>
            <Button>
              <Link href="/keep/save">创建笔记</Link>
            </Button>
          </AuthenticatedOnly>
        )}
      >
        <KeepList />
      </Container>
    </HydrateClient>
  )
}
