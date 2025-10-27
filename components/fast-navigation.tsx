"use client"

import { useRouter } from 'next/navigation'
import { useCallback, startTransition } from 'react'

// High-performance navigation link component for mobile
interface FastLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function FastLink({ href, children, className, onClick }: FastLinkProps) {
  const router = useRouter()
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    // Use startTransition for non-urgent updates
    startTransition(() => {
      router.push(href)
    })
  }, [href, router, onClick])

  return (
    <a 
      href={href} 
      className={className} 
      onClick={handleClick}
      style={{ 
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent' // Remove touch highlight on mobile
      }}
    >
      {children}
    </a>
  )
}

// Navigation loading state manager (simplified)
export function useNavigationLoader() {
  return { isNavigating: false, navigate: (href: string) => window.location.href = href }
}