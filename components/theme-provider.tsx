"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"           // Force dark mode from the start
      enableSystem={false}           // Ignore system preference → consistent look
      disableTransitionOnChange      // Prevents flash on load
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}