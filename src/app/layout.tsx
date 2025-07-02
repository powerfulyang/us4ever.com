import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import { UserProvider } from '@/components/auth/user-provider'
import ServiceWorkerRegister from '@/components/pwa/Register'
import { BASE_URL } from '@/lib/constants'

import { TRPCReactProvider } from '@/trpc/react'

import { api } from '@/trpc/server'
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

interface Props {
  children: ReactNode
}

export default async function RootLayout({ children }: Props) {
  const user = await api.user.current()

  return (
    <html lang="en">
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
      <body className="dark">
        <ServiceWorkerRegister />
        <TRPCReactProvider>
          <UserProvider user={user} />
          {children}
          <ToastContainer theme="colored" />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
