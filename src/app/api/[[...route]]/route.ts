import { handle } from 'hono/vercel'
import { app } from '@/server/hono'

export const GET = handle(app)
export const POST = handle(app)
