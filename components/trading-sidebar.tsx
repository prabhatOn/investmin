"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  BarChart3,
  TrendingUp,
  History,
  Wallet,
  Key,
  UserCheck,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { MobileNavItem } from "@/components/mobile-nav-item"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Portal from '@/components/portal'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  forceMobileNav?: boolean
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/",
  },
  {
    title: "Positions",
    icon: TrendingUp,
    href: "/positions",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Funds",
    icon: Wallet,
    href: "/funds",
  },
  {
    title: "API Access",
    icon: Key,
    href: "/api-access",
  },
  {
    title: "Introducing Broker",
    icon: UserCheck,
    href: "/introducing-broker",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  },
]

export function TradingSidebar({ className, collapsed = false, onCollapsedChange, forceMobileNav }: SidebarProps) {
  const STORAGE_KEY = "sidebar_collapsed"

  // Read persisted value synchronously so initial render can use it and
  // avoid flashing the sidebar open when navigating between pages.
  const [persistedCollapsed, setPersistedCollapsed] = useState<boolean | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      return raw === null ? null : raw === "true"
    } catch {
      return null
    }
  })

  // Effective collapsed state used for rendering. If we have a persisted
  // value use that; otherwise fall back to the parent-controlled prop.
  const isCollapsed = persistedCollapsed !== null ? persistedCollapsed : collapsed

  const handleToggle = () => {
    const next = !isCollapsed
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // ignore
    }

    setPersistedCollapsed(next)
    onCollapsedChange?.(next)
  }

  // When component mounts, if there's a persisted value, sync it into the
  // parent so other parts of the app reflect the user's preference.
  useEffect(() => {
    if (persistedCollapsed !== null && onCollapsedChange && persistedCollapsed !== collapsed) {
      onCollapsedChange(persistedCollapsed)
    }
    // We only want to run this on mount; deps intentionally exclude
    // onCollapsedChange/collapsed to avoid repeated updates during normal
    // renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pathname = usePathname() || "/"
  
  // Window width detection to control when to show the full sidebar vs
  // the mobile/bottom navigation. Use 961 here so devices up to 960px
  // will use the bottom navigation (per request: 629..960 should show
  // bottom navigation). Adjust as needed.
  const DESKTOP_BREAKPOINT = 1023
  const [innerWidth, setInnerWidth] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => setInnerWidth(typeof window !== "undefined" ? window.innerWidth : null)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isDesktop = !forceMobileNav && (innerWidth ?? (typeof window !== "undefined" ? window.innerWidth : 0)) >= DESKTOP_BREAKPOINT


  // Mobile primary items: Dashboard, Watchlist (mobile only), Positions, Funds
  const watchlistItem = { title: "Watchlist", icon: Star, href: "/mobile/watchlist" }
  const mobilePrimary = [sidebarItems[0], watchlistItem, sidebarItems[1], sidebarItems[3]]
  const mobileMore = sidebarItems.filter((it) => !mobilePrimary.includes(it))

  return (
    <>
      {isDesktop ? (
        <div
          className={cn(
            "flex flex-col border-r transition-all duration-300 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40",
            "bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 backdrop-blur-xl",
            "border-gray-700/50 shadow-2xl shadow-black/50",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
            isCollapsed ? "w-16" : "w-64",
            className,
          )}
          style={{
            boxShadow:
              "inset 1px 1px 2px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-black/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20 pointer-events-none"></div>
            <div className="flex items-center space-x-2 relative z-10">
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                 
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200 relative z-10 shadow-sm hover:shadow-md"
              style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-6 overflow-hidden">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "w-full flex items-center h-12 transition-all duration-200 font-medium text-sm whitespace-nowrap rounded-lg group relative overflow-hidden",
                      isCollapsed ? "px-2 justify-center" : "px-4 justify-start",
                      isActive
                        ? "bg-gradient-to-r from-gray-700/80 to-black/80 text-white shadow-lg border border-gray-600/30"
                        : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-md hover:border hover:border-gray-600/30",
                    )}
                    style={
                      isActive
                        ? {
                            boxShadow:
                              "inset 2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.3)",
                          }
                        : {}
                    }
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-gray-600/20 to-black/20 opacity-0 transition-opacity duration-200",
                        !isActive && "group-hover:opacity-100",
                      )}
                      style={{ boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.1)" }}
                    />

                    <item.icon
                      className={cn(
                        "h-5 w-5 relative z-10 transition-all duration-200 drop-shadow-sm",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                      )}
                    />
                    {!isCollapsed && <span className="relative z-10 transition-all duration-200 drop-shadow-sm">{item.title}</span>}

                    {isActive && (
                      <div
                        className="absolute right-2 w-2 h-2 bg-gray-300 rounded-full animate-pulse shadow-inner"
                        style={{ boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.3)" }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-700/30 bg-gradient-to-r from-gray-800/30 to-black/20 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-white/5 pointer-events-none"></div>

              <div className="text-xs text-gray-400 text-center space-y-2 relative z-10">
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="w-14 h-14 rounded bg-gradient-to-br from-gray-600 to-black flex items-center justify-center shadow-inner overflow-hidden"
                    style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.1)" }}
                  >
                    <Image src="/logo_mi.png" alt="InvestMin" width={80} height={80} className="object-contain" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-300 drop-shadow-sm">Investmin v2.1.0</p>
                    <p className="text-gray-500">© 2025 All rights reserved</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700/20">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg" style={{ boxShadow: "0 0 4px rgba(34, 197, 94, 0.5), inset 1px 1px 2px rgba(255,255,255,0.2)" }} />
                    <span className="text-gray-400 drop-shadow-sm">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Portal>
          <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-800/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1), 0 -10px 20px rgba(0,0,0,0.3)" }}>
            <nav className="flex items-center justify-between h-14 px-1">
              {mobilePrimary.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return <MobileNavItem key={item.href} href={item.href} icon={item.icon} title={item.title} isActive={isActive} />
              })}

              <div className="flex-1 flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center py-2 px-3 text-xs transition-all duration-200 hover:bg-gradient-to-t hover:from-gray-700/30 hover:to-gray-600/20 rounded-lg group" style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
                      <Avatar className="h-6 w-6 ring-2 ring-gray-600 group-hover:ring-gray-400 transition-all duration-200 shadow-md" style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.1)" }}>
                        <AvatarImage src="" alt="Menu" />
                        <AvatarFallback className="bg-gradient-to-br from-gray-600 to-black text-white text-xs font-bold">Me</AvatarFallback>
                      </Avatar>
                      <span className="mt-1 text-[10px] text-gray-400 group-hover:text-white transition-colors duration-200 font-medium drop-shadow-sm">More</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 bg-gray-800/95 border-gray-700/50 backdrop-blur-xl shadow-2xl" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.1)" }}>
                    {mobileMore.map((it) => (
                      <DropdownMenuItem asChild key={it.href} className="hover:bg-gray-700/50 text-gray-200 hover:text-white transition-all duration-200">
                        <Link href={it.href} className="flex items-center space-x-2 drop-shadow-sm">
                          <it.icon className="h-4 w-4" />
                          <span>{it.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          </div>
        </Portal>
      )}

      {/* Dev debug badge removed for production UI */}
    </>
  )
}
