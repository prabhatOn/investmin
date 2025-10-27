"use client"

import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed"
import { TradingSidebar } from "@/components/trading-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useState, lazy, Suspense, useEffect } from "react"
import { ChevronLeft, Loader2 } from "lucide-react"

// Lazy load heavy components for better performance
const TradingChart = lazy(() => import("@/components/trading-chart"))
const PositionsTable = lazy(() => import("@/components/positions-table"))
const BottomStatsBar = lazy(() => import("@/components/bottom-stats-bar"))
const WishlistPanel = lazy(() => import("@/components/wishlist-panel"))

// Loading component for Suspense fallbacks with more prominent styling
const ComponentLoader = ({ className = "" }: { className?: string }) => (
  <div className={`trading-card-override flex items-center justify-center ${className} rounded-xl m-2`}>
    <div className="flex flex-col items-center gap-3 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-300 drop-shadow-lg" />
      <span className="text-sm text-gray-400 drop-shadow-md font-medium">Loading...</span>
    </div>
  </div>
)

export default function TradingDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(true)
  const [innerWidth, setInnerWidth] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => setInnerWidth(typeof window !== 'undefined' ? window.innerWidth : null)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentWidth = innerWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 0)
  const forceMobileOnTablet = currentWidth >= 629 && currentWidth <= 1023

  // Compute padding classes: when forcing mobile on tablet, remove the
  // sm:pl-* left padding reserved for the fixed sidebar so dashboard
  // content can be full-bleed in that range.
  const paddingClass = forceMobileOnTablet
    ? "pl-1 pr-1 pt-1 pb-16 sm:pb-4"
    : sidebarCollapsed
    ? "sm:pl-20 pl-1 pr-1 pt-1 pb-16 sm:pb-4"
    : "sm:pl-68 pl-1 pr-1 pt-1 pb-16 sm:pb-4"

  return (
    <ProtectedRoute>
      <div className="trading-dashboard min-h-screen flex flex-col relative">
        {/* Enhanced pattern overlay for more visible texture */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
            backgroundSize: '100px 100px'
          }}
        ></div>
        
          <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Sidebar */}
          <TradingSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            // Dashboard: prefer mobile bottom nav on mid-size devices to avoid overlap
            // only force on tablet range so larger desktops still show sidebar
            forceMobileNav={forceMobileOnTablet}
          />

          {/* Main Content */}
          <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 w-full ${paddingClass}`}>
            {/* Centered wrapper so dashboard sections align with other pages. */}
            {/* When forcing mobile bottom nav on tablet, allow full-width content. */}
            <div className={forceMobileOnTablet ? "w-full" : "w-full max-w-screen-xl mx-auto"}>
            {/* Notifications Section removed per request */}

            {/* Quick shortcuts removed from main - moved to mobile bottom nav per user request */}

            {/* Chart Section - enhanced with more visible 3D effects and attractive styling */}
            <section className="chart-container h-[45vh] sm:h-[58vh] md:h-[55vh] lg:h-[58vh] xl:h-[60vh] mb-2 relative p-2 rounded-xl">
              
              {/* On small screens stack vertically: chart -> wishlist -> positions
                  On larger screens show chart + wishlist docked as sibling columns. */}
              <div className="h-full w-full flex flex-col lg:flex-row relative z-10 p-2">
                {/* Chart column with more visible enhanced styling */}
                <div className={`trading-card-override transition-all duration-300 relative rounded-xl overflow-hidden ${isWishlistOpen ? 'lg:w-3/4 h-full' : 'w-full h-full'}`}>
                  <div className="relative z-10 h-full rounded-xl overflow-hidden">
                    <Suspense fallback={<ComponentLoader className="h-full" />}>
                      <TradingChart key={isWishlistOpen ? 'split' : 'full'} />
                    </Suspense>
                  </div>
                </div>

                {/* Dedicated tab column with more prominent 3D styling */}
                <div className="hidden lg:flex w-2 items-center justify-center">
                  {!isWishlistOpen && (
                    <button
                      type="button"
                      aria-label="Open watchlist"
                      onClick={() => setIsWishlistOpen(true)}
                      className="h-32 w-full flex items-center justify-center bg-gradient-to-br from-gray-700/90 to-black/80 backdrop-blur shadow-lg hover:from-gray-600/90 hover:to-gray-700/80 transition-all rounded-xl px-1 border-2 border-gray-600/40"
                      style={{
                        boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.15), 4px 4px 12px rgba(0,0,0,0.3)"
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ChevronLeft className="w-3 h-3 text-gray-200 drop-shadow-md" />
                        <span className="text-[10px] text-gray-200/90 tracking-wider drop-shadow-md font-medium" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                          List
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Wishlist column - only visible on large screens (hidden on mobile) with no gap */}
                <div className={`hidden lg:block transition-all duration-300 ${isWishlistOpen ? 'lg:w-1/4 overflow-hidden' : 'w-0 overflow-hidden'}`} style={isWishlistOpen ? { height: '100%' } : undefined}>
                  <Suspense fallback={<ComponentLoader className="h-full" />}>
                    <WishlistPanel isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} inline={true} />
                  </Suspense>
                </div>
              </div>
            </section>

            {/* Positions Table - enhanced with more visible 3D effects */}
            <section className="positions-container flex-1 min-h-0 max-h-[80vh] sm:max-h-none relative p-2 rounded-xl">
              
              <div className="relative z-10 h-full rounded-xl overflow-auto m-2">
                <div className="trading-card-override relative z-10 h-full min-h-0 rounded-xl overflow-auto">
                  <Suspense fallback={<ComponentLoader className="h-32" />}>
                    <PositionsTable />
                  </Suspense>
                </div>
              </div>
            </section>
            </div>
          </main>

          {/* Wishlist removed per request */}
        </div>

        {/* Bottom stats bar (fixed) */}
        <Suspense fallback={<ComponentLoader className="h-12" />}>
          <BottomStatsBar />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
