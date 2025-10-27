'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from './navigation/navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  const { isLoading, isAuthenticated } = useAuth()
  
  // Hide navbar on auth pages, admin pages, or during authentication loading
  const hideNavbar = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname?.startsWith('/admin') ||
    isLoading ||
    (!isAuthenticated && pathname !== '/')
  
  if (hideNavbar) {
    return null
  }
  
  return <Navbar />
}