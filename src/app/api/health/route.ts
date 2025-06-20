import { NextResponse } from 'next/server'
import { checkHealth, PerformanceMonitor } from '@/lib/monitoring'

export async function GET() {
  return PerformanceMonitor.measureAsync('health-check', async () => {
    const healthStatus = await checkHealth()

    return NextResponse.json({
      ...healthStatus,
      timestamp: new Date().toISOString(),
      service: 'home.us4ever',
      version: process.env.npm_package_version,
    }, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
    })
  })
}
