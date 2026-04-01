'use server'

import { cookies } from 'next/headers'
import { COOKIE_NAME } from '@/server/hono/middleware/auth'

export async function logout() {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}
