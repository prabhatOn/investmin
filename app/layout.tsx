import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navigation/navbar"
import { AppProviders } from "@/contexts/AppProviders"
import { Toaster } from "@/components/ui/sonner"
import { Suspense } from "react"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { RoutePrefetcher } from "@/components/route-prefetcher"
import { NavigationPerformanceMonitor } from "@/components/navigation-performance"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TradePro - Advanced Trading Dashboard",
  description: "Professional trading platform with real-time market data and advanced analytics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_mi.png" />
      </head>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <AppProviders>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <NavigationPerformanceMonitor />
              <RoutePrefetcher />
              <ConditionalNavbar />
              {children}
              <Toaster richColors closeButton />
            </ThemeProvider>
          </AppProviders>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
