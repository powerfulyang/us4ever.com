import type { Metadata } from 'next'
import Link from 'next/link'
import { KeepList } from '@/app/(full-layout)/keep/components/list'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { SearchForm } from '@/components/search-form'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: 'Keep',
  description: 'A place to record inspiration and thinking',
  alternates: {
    canonical: `/keep`,
  },
}

export default async function KeepPage() {
  await api.keep.infinite_list.prefetch({})
  return (
    <HydrateClient>
      <Container
        title="我的笔记本"
        description="记录灵感与思考的地方"
        rightContent={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <SearchForm className="flex-1" searchPath="/keep/search" />
              <Button>
                <Link href="/keep/save">创建笔记</Link>
              </Button>
            </div>
          </AuthenticatedOnly>
        )}
      >
        <KeepList />
      </Container>
    </HydrateClient>
  )
}
