'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

interface Props extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode
}

export function ThemeProvider({
  children,
  ...props
}: Props) {
  return (
    <NextThemesProvider
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
