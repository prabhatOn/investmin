"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Common routes that users frequently navigate to
const ROUTES_TO_PREFETCH = [
  '/',
  '/positions', 
  '/history',
  '/funds',
  '/profile',
  '/settings',
  '/mobile/watchlist'
]

export function RoutePrefetcher() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch routes after a short delay to avoid blocking initial load
    const timer = setTimeout(() => {
      ROUTES_TO_PREFETCH.forEach(route => {
        router.prefetch(route)
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return null
}