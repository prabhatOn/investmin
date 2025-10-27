"use client"

import { useEffect, useState } from "react"
import Portal from "@/components/portal"
import { useTrading } from "@/contexts/TradingContext"
import { useSidebarCollapsed } from '@/hooks/use-sidebar-collapsed'

export default function BottomStatsBar() {
  const { activeAccount, accountSummary } = useTrading()
  const [sidebarCollapsed] = useSidebarCollapsed(false)
  const [innerWidth, setInnerWidth] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => setInnerWidth(typeof window !== 'undefined' ? window.innerWidth : null)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentWidth = innerWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 0)
  const forceMobileOnTablet = currentWidth >= 629 && currentWidth <= 1023
  const [stats, setStats] = useState({
    balance: 0,
    equity: 0,
    usedMargin: 0,
    freeMargin: 0,
    marginLevel: 0,
    unrealizedPnl: 0,
    todayPnl: 0,
    totalPnl: 0
  })

  useEffect(() => {
    if (activeAccount) {
      const balance = activeAccount.balance || 0
      const equity = activeAccount.equity || 0
      const unrealizedPnl = parseFloat((equity - balance).toFixed(2))
      setStats(prev => ({
        ...prev,
        balance,
        equity,
        usedMargin: activeAccount.usedMargin || 0,
        freeMargin: activeAccount.freeMargin || 0,
        marginLevel: activeAccount.marginLevel || 0,
        unrealizedPnl
      }))
    }

    if (accountSummary) {
      setStats(prev => ({
        ...prev,
        todayPnl: accountSummary.todayPnl || 0,
        totalPnl: accountSummary.totalPnl || 0,
      }))
    }
  }, [activeAccount, accountSummary])

  useEffect(() => {
    const handler = () => {
      if (activeAccount) {
        const balance = activeAccount.balance || 0
        const equity = activeAccount.equity || 0
        const unrealizedPnl = parseFloat((equity - balance).toFixed(2))
        setStats(prev => ({
          ...prev,
          balance,
          equity,
          usedMargin: activeAccount.usedMargin || 0,
          freeMargin: activeAccount.freeMargin || 0,
          marginLevel: activeAccount.marginLevel || 0,
          unrealizedPnl
        }))
      }

      if (accountSummary) {
        setStats(prev => ({
          ...prev,
          todayPnl: accountSummary.todayPnl || 0,
          totalPnl: accountSummary.totalPnl || 0,
        }))
      }
    }
    window.addEventListener('balanceUpdate', handler)
    return () => window.removeEventListener('balanceUpdate', handler)
  }, [activeAccount, accountSummary])

  return (
    <Portal>
      <div className="fixed left-0 right-0 sm:bottom-12 lg:bottom-0 bottom-14 bg-gradient-to-r from-gray-900/95 via-black/90 to-gray-800/95 backdrop-blur-xl border-t border-gray-700/50 z-[10] py-2 shadow-2xl"
           style={{
             boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1), 0 -8px 32px rgba(0,0,0,0.3)"
           }}>
  <div className={`${forceMobileOnTablet ? 'w-full' : 'max-w-screen-xl mx-auto'} transition-all duration-300 ${sidebarCollapsed ? 'sm:pl-20 pl-4 pr-4' : 'sm:pl-68 pl-4 pr-4'}`}>
        {/* Mobile layout - enhanced styling */}
        <div className="flex sm:flex items-center lg:hidden justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="text-gray-300">Balance: <span className="font-mono text-white drop-shadow-sm">${stats.balance.toFixed(2)}</span></div>
            <div className="text-gray-300">Free: <span className="font-mono text-white drop-shadow-sm">${stats.freeMargin.toFixed(2)}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-gray-300">Today P&L: <span className={`font-mono drop-shadow-sm ${stats.todayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.todayPnl >= 0 ? '+' : ''}${stats.todayPnl.toFixed(2)}</span></div>
            {stats.marginLevel > 0 && (
              <div className="text-gray-300">Margin: <span className="font-mono text-white drop-shadow-sm">{stats.marginLevel.toFixed(1)}%</span></div>
            )}
          </div>
        </div>

        {/* Desktop layout - enhanced styling */}
        <div className="hidden sm:Hidden lg:flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="text-gray-300">Balance: <span className="font-mono text-white drop-shadow-sm">${stats.balance.toFixed(2)}</span></div>
            {Number(stats.equity.toFixed(2)) !== Number(stats.balance.toFixed(2)) && (
              <div className="text-gray-300">Equity: <span className="font-mono text-white drop-shadow-sm">${stats.equity.toFixed(2)}</span></div>
            )}
            <div className="text-gray-300">Unrealized P&L: <span className={`font-mono drop-shadow-sm ${stats.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.unrealizedPnl >= 0 ? '+' : ''}${stats.unrealizedPnl.toFixed(2)}</span></div>
            <div className="text-gray-300">Today P&L: <span className={`font-mono drop-shadow-sm ${stats.todayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.todayPnl >= 0 ? '+' : ''}${stats.todayPnl.toFixed(2)}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-300">Used: <span className="font-mono text-white drop-shadow-sm">${stats.usedMargin.toFixed(2)}</span></div>
            <div className="text-gray-300">Free: <span className="font-mono text-white drop-shadow-sm">${stats.freeMargin.toFixed(2)}</span></div>
            <div className="text-gray-300">Margin Level: <span className="font-mono text-white drop-shadow-sm">{stats.marginLevel.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  )
}
