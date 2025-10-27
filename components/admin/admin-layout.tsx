"use client"

import React, { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopBar } from "@/components/admin/admin-topbar"
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed"
import { useTheme } from "next-themes"

// Temporary inline types until we fix the imports
interface SidebarItem {
  title: string
  icon?: React.ElementType
  href: string
  description?: string
}

interface TopBarConfig {
  title: string
  showBalance?: boolean
  showNotifications?: boolean
  showDeposit?: boolean
  showUserMenu?: boolean
}

interface AdminLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  topBarConfig: TopBarConfig
}

export function AdminLayout({ children, sidebarItems, topBarConfig }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed(false)
  const { setTheme } = useTheme()

  // Force dark theme for admin dashboard
  useEffect(() => {
    setTheme('dark')
    // Also add dark class to body as backup
    document.body.classList.add('dark')
    document.documentElement.classList.add('dark')
    
    return () => {
      // Don't remove dark class on cleanup as user might want to stay in dark mode
    }
  }, [setTheme])

  return (
    <div className="trading-dashboard min-h-screen">
      {/* Fixed Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        items={sidebarItems}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16 ml-0" : "lg:ml-64 ml-0"
        }`}
      >
        {/* Top Bar */}
        <AdminTopBar config={topBarConfig} />

        {/* Scrollable Content */}
        <main className="min-h-[calc(100vh-4rem)] overflow-auto">
          <div className="p-6 pb-24 lg:pb-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}