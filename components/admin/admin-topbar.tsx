"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { LogOut, Sun, Moon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import Image from "next/image"

interface TopBarConfig {
  title: string
  showBalance?: boolean
  showNotifications?: boolean
  showDeposit?: boolean
  showUserMenu?: boolean
}

interface AdminTopBarProps {
  config: TopBarConfig
}

export function AdminTopBar({ config }: AdminTopBarProps) {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState("super_admin")
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    if (isLoggingOut) return // Prevent multiple clicks
    
    setIsLoggingOut(true)
    
    // Perform logout in background
    logout().catch(console.error)
    
    // Immediately redirect without waiting for async operations
    window.location.href = '/login'
  }

  // Prevent theme-related rendering until component is mounted
  if (!mounted || isLoggingOut) {
    return (
      <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-gray-900/90 backdrop-blur-xl px-4 sm:px-6 sticky top-0 z-30 border-gray-700/50 shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image 
                src="/logo_mi.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono truncate">
                {config.title}
              </h1>
              <p className="hidden xs:block text-xs text-gray-400 font-medium truncate">Administrative Control Center</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="inline-flex items-center px-2 text-gray-400 hover:text-white hover:bg-gray-800/50">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-gray-900/90 backdrop-blur-xl px-4 sm:px-6 sticky top-0 z-30 border-gray-700/50 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-700 to-black flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono truncate">
              {config.title}
            </h1>
            <p className="hidden xs:block text-xs text-gray-400 font-medium truncate">Administrative Control Center</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role selector (small) */}
        <div className="hidden xs:flex items-center space-x-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[140px] h-8 bg-gray-800/50 border-gray-700/50 shadow-sm font-medium text-sm text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50">
              <SelectItem value="admin" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Admin</SelectItem>
              <SelectItem value="super_admin" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Super Admin</SelectItem>
              <SelectItem value="administrator" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme toggle */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="inline-flex p-2 text-gray-400 hover:text-white hover:bg-gray-800/50" 
          onClick={() => {
            try {
              setTheme(theme === 'dark' ? 'light' : 'dark')
            } catch (error) {
              console.error('Theme toggle error:', error)
            }
          }}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Logout */}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="inline-flex items-center px-2 text-gray-400 hover:text-white hover:bg-gray-800/50">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}