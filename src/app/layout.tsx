import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import * as React from 'react'
import { Suspense } from 'react'
import { UserProvider } from '@/components/auth/user-provider'
import { PageProgress } from '@/components/page-progress'
import ServiceWorkerRegister from '@/components/pwa/Register'
import { ThemeProvider } from '@/components/theme-provider'
import { BASE_URL } from '@/lib/constants'

import { TRPCReactProvider } from '@/trpc/react'
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#020203' },
  ],
  viewportFit: 'cover',
}

interface Props {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
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
        <Script id="umami" strategy="lazyOnload" src="https://umami.us4ever.com/script.js" data-website-id="650103e6-dc4e-4c71-902d-110fdc3fc4e6" />
        <Script id="gtag" strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-WCQH3VE45C" />
        <Script id="gtag-init" strategy="lazyOnload">
          {`if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments)
            }
            gtag('js', new Date());

            gtag('config', 'G-WCQH3VE45C');
          }`}
        </Script>
        <Script
          id="adsbygoogle"
          strategy="lazyOnload"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9168111994170008"
          crossOrigin="anonymous"
        >
        </Script>
        <link rel="preload" href="https://help.littleeleven.com/font.css" as="style" />
        <link rel="stylesheet" href="https://help.littleeleven.com/font.css" />
        <noscript><link rel="stylesheet" href="https://help.littleeleven.com/font.css" /></noscript>
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
            <UserProvider user={undefined} />
            <Suspense fallback={null}>
              <PageProgress />
            </Suspense>
            {children}
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
