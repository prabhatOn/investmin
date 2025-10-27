"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMarket } from "@/contexts/MarketContext"
import { TradeDialog } from "@/components/trade-dialog"

const DEFAULT_SYMBOLS = ["EURUSD", "USDJPY", "GBPUSD", "XAUUSD", "BTCUSD"]

export default function MobileWatchlist() {
  const router = useRouter()
  const { marketData, setSelectedSymbol } = useMarket()
  const [symbols, setSymbols] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('watchlist_symbols')
        if (raw) return JSON.parse(raw)
      }
    } catch {
      // ignore
    }
    return DEFAULT_SYMBOLS
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('watchlist_symbols', JSON.stringify(symbols))
      }
    } catch {
      // ignore
    }
  }, [symbols])

  const removeSymbol = (sym: string) => setSymbols(prev => prev.filter(s => s !== sym))

  const openInDashboard = (sym: string) => {
    setSelectedSymbol(sym)
    router.push('/')
  }

  return (
    <div className="lg:hidden min-h-screen bg-background p-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Watchlist</h2>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {symbols.map((s) => {
          const md = marketData.find(m => m.symbol === s)
          const price = md?.currentPrice ?? md?.closePrice ?? 0
          const bid = md?.bid ?? null
          const ask = md?.ask ?? null
          const fmt = (v: number | null | undefined) => (typeof v === 'number' ? v.toString() : '-')
          return (
            <Card key={s} className="p-3 bg-gray-900 border border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-white text-base">{s}</div>
                      <div className="text-xs text-muted-foreground mt-1">Price: <span className="font-mono block truncate max-w-[8rem]">{price}</span></div>
                    </div>
                    <div className="text-right text-xs min-w-0 space-y-1">
                      <div className="text-emerald-400">Bid: <span className="font-mono block truncate max-w-[6rem]">{fmt(bid)}</span></div>
                      <div className="text-rose-400">Ask: <span className="font-mono block truncate max-w-[6rem]">{fmt(ask)}</span></div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <Button size="sm" onClick={() => openInDashboard(s)} className="w-full sm:flex-1 sm:min-w-0">Open Chart</Button>

                    <div className="mt-2 sm:mt-0 flex items-center gap-2">
                      <TradeDialog symbol={s} symbolId={md?.symbolId ?? 0} price={String(ask ?? price)} type="buy">
                        <Button size="sm" className="bg-emerald-600 text-white">Buy</Button>
                      </TradeDialog>

                      <TradeDialog symbol={s} symbolId={md?.symbolId ?? 0} price={String(bid ?? price)} type="sell">
                        <Button size="sm" variant="destructive">Sell</Button>
                      </TradeDialog>

                      <Button variant="ghost" size="sm" aria-label={`Remove ${s}`} onClick={() => removeSymbol(s)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      </div>
    </div>
  )
}
