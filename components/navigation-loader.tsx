"use client"

import { useNavigationLoader } from './fast-navigation'
import { Loader2 } from 'lucide-react'

export function NavigationLoader() {
  const { isNavigating } = useNavigationLoader()

  if (!isNavigating) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}