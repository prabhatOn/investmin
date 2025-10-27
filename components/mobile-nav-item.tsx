"use client"

import { useRouter } from 'next/navigation'
import { useCallback, memo } from 'react'
import { cn } from '@/lib/utils'

// Mobile-optimized navigation item
const MobileNavItem = memo(({ 
  href, 
  icon: Icon, 
  title, 
  isActive 
}: {
  href: string
  icon: any
  title: string
  isActive: boolean
}) => {
  const router = useRouter()
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Immediate visual feedback
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.7'
    target.style.transform = 'scale(0.95)'
    
    // Reset visual state quickly
    setTimeout(() => {
      target.style.opacity = ''
      target.style.transform = ''
    }, 100)
    
    // Fast navigation without delay
    router.push(href)
  }, [href, router])

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center py-2 text-xs transition-all duration-200 mobile-nav-item relative group rounded-lg mx-1",
        "hover:bg-gradient-to-t hover:from-gray-700/30 hover:to-gray-600/20",
        isActive 
          ? "text-white bg-gradient-to-t from-gray-700/60 to-black/30 shadow-lg" 
          : "text-gray-400 hover:text-white"
      )}
      style={{ 
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        willChange: 'opacity, transform',
        ...(isActive ? {
          boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)"
        } : {
          boxShadow: "1px 1px 2px rgba(0,0,0,0.1)"
        })
      }}
    >
      {/* Active indicator with 3D effect */}
      {isActive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-md"
             style={{
               boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)"
             }} />
      )}
      
      <Icon className={cn(
        "h-5 w-5 transition-all duration-200 drop-shadow-sm",
        isActive ? "text-white scale-110" : "text-gray-400 group-hover:text-white group-hover:scale-105"
      )} />
      
      <span className={cn(
        "mt-1 text-[10px] transition-all duration-200 font-medium drop-shadow-sm",
        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-200"
      )}>
        {title}
      </span>
      
      {/* Subtle 3D effect for active state */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-gray-500/10 rounded-lg pointer-events-none"
             style={{
               boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.1)"
             }} />
      )}
    </a>
  )
})

MobileNavItem.displayName = 'MobileNavItem'

export { MobileNavItem }