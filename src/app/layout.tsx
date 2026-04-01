import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import * as React from 'react'
import { UserProvider } from '@/components/auth/user-provider'
import { PageProgress } from '@/components/page-progress'
import ServiceWorkerRegister from '@/components/pwa/Register'
import { ThemeProvider } from '@/components/theme-provider'
import { BASE_URL } from '@/lib/constants'

import { TRPCReactProvider } from '@/trpc/react'

import { api } from '@/trpc/server'
import '@/styles/globals.scss'
import 'react-photo-view/dist/react-photo-view.css'

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
        {/* 预加载关键字体 */}
        <link rel="preload" href="https://help.littleeleven.com/FiraCode/FiraCode-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="https://help.littleeleven.com/FiraCode/FiraCode-Medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="https://help.littleeleven.com/FiraCode/FiraCode-SemiBold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="https://help.littleeleven.com/LXGW-WENKAI/LXGWWenKaiScreen.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <Script
          id="umami"
          defer
          src="https://umami.us4ever.com/script.js"
          data-website-id="650103e6-dc4e-4c71-902d-110fdc3fc4e6"
        />
        <Script id="gtag" async src="https://www.googletagmanager.com/gtag/js?id=G-WCQH3VE45C"></Script>
        <Script id="gtag-init">
          {`if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments)
            }
            gtag('js', new Date());

            gtag('config', 'G-WCQH3VE45C');
          }`}
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
            <PageProgress />
            {children}
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
