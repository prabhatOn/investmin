"use client"

import { memo } from 'react'

// Performance monitoring for mobile navigation
export const NavigationPerformanceMonitor = memo(() => {
  if (typeof window === 'undefined') return null

  // Add viewport meta tag for better mobile performance
  if (!document.querySelector('meta[name="viewport"][content*="interactive-widget"]')) {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content'
    document.head.appendChild(meta)
  }

  // Disable iOS bounce effect
  document.body.style.overscrollBehavior = 'none'
  document.documentElement.style.overscrollBehavior = 'none'

  // Add mobile performance optimizations
  const style = document.createElement('style')
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent !important;
      -webkit-touch-callout: none !important;
    }
    
    body {
      -webkit-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
    
    .mobile-nav-item {
      will-change: opacity;
      transform: translateZ(0);
    }
    
    @media (max-width: 768px) {
      * {
        pointer-events: auto !important;
      }
    }
  `
  
  if (!document.head.querySelector('#mobile-perf-styles')) {
    style.id = 'mobile-perf-styles'
    document.head.appendChild(style)
  }

  return null
})

NavigationPerformanceMonitor.displayName = 'NavigationPerformanceMonitor'