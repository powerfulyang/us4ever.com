'use server'

import { COOKIE_NAME } from '@/server/hono'
import { cookies } from 'next/headers'

export async function logout() {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}
