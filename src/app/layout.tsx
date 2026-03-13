import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import * as React from 'react'
import { UserProvider } from '@/components/auth/user-provider'
import ServiceWorkerRegister from '@/components/pwa/Register'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { BASE_URL } from '@/lib/constants'

import { TRPCReactProvider } from '@/trpc/react'

import { api } from '@/trpc/server'
import '@/styles/globals.scss'

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#020203' },
  ],
  viewportFit: 'cover',
}

interface Props {
  children: ReactNode
}

export default async function RootLayout({ children }: Props) {
  const user = await api.user.current()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>
          {metadata.title as string}
        </title>
        <Script
          defer
          src="https://umami.us4ever.com/script.js"
          data-website-id="650103e6-dc4e-4c71-902d-110fdc3fc4e6"
        >
        </Script>
        <link rel="stylesheet" href="https://help.littleeleven.com/font.css" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <ServiceWorkerRegister />
          <TRPCReactProvider>
            <UserProvider user={user} />
            {children}
            <Toaster />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
