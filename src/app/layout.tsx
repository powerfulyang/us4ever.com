import type { Metadata, Viewport } from 'next'
import { UserProvider } from '@/components/auth/user-provider'
import { TRPCReactProvider } from '@/trpc/react'
import { api, HydrateClient } from '@/trpc/server'
import Script from 'next/script'
import React from 'react'
import { ToastContainer } from 'react-toastify'

import '@/styles/globals.scss'
import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: 'Resource Hub',
  description: 'A comprehensive hub for developers and tech enthusiasts, featuring coding tutorials, tools, libraries, and industry insights.',
  metadataBase: new URL(BASE_URL),
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await api.user.current.prefetch()
  return (
    <html lang="zh-CN">
      <Script
        defer
        src="https://umami.us4ever.com/script.js"
        data-website-id="650103e6-dc4e-4c71-902d-110fdc3fc4e6"
      >
      </Script>
      <body>
        <TRPCReactProvider>
          <HydrateClient>
            <UserProvider />
          </HydrateClient>
          {children}
          <ToastContainer theme="colored" />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
