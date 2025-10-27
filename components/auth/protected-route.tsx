'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const hasAdminAccess = useMemo(() => {
    const primaryRole = user?.role?.toLowerCase();
    const adminRoleVariants = ['admin', 'administrator', 'super_admin', 'superadmin', 'root'];
    
    if (adminRoleVariants.includes(primaryRole)) {
      return true;
    }

    if (Array.isArray(user?.roles)) {
      return user.roles.some((role) => {
        const normalizedRole = role?.toLowerCase();
        return adminRoleVariants.includes(normalizedRole);
      });
    }

    return false;
  }, [user])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Use setTimeout to avoid conflicts with ongoing React operations
        setTimeout(() => {
          router.push('/login')
        }, 0)
        return
      }

      if (requireAdmin && !hasAdminAccess) {
        setTimeout(() => {
          router.push('/')
        }, 0)
        return
      }
    }
  }, [isAuthenticated, isLoading, hasAdminAccess, requireAdmin, router])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireAdmin && !hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}