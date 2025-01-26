'use server'

import { COOKIE_NAME } from '@/app/api/[[...route]]/route'
import { cookies } from 'next/headers'

export async function logout() {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}
