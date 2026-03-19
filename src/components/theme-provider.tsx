'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import * as React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Props extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode
}

function InnerThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <>
      {children}
      <ToastContainer
        position="bottom-right"
        theme={theme as any}
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export function ThemeProvider({
  children,
  ...props
}: Props) {
  return (
    <NextThemesProvider
      {...props}
    >
      <InnerThemeProvider>
        {children}
      </InnerThemeProvider>
    </NextThemesProvider>
  )
}
