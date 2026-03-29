'use client'
import { useEffect } from 'react'

async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
    }
    catch {
      // Ignore registration errors (handled by Sentry ignoreErrors as well)
    }
  }
}
export default function ServiceWorkerRegister() {
  useEffect(() => {
    void registerServiceWorker()
  }, [])
  return null
}
