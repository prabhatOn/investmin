"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronRight } from "lucide-react"
import { TradeDialog } from "@/components/trade-dialog"
import { useTrading } from "@/contexts/TradingContext"
import { useMarket } from "@/contexts/MarketContext"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { marketService } from "@/lib/services"

interface Props {
  isOpen: boolean
  onClose: () => void
  inline?: boolean
}

const DEFAULT_SYMBOLS = ["EURUSD", "USDJPY", "GBPUSD", "XAUUSD", "BTCUSD"]

type SymbolResult = { id: number; symbol: string; name?: string }

export default function WishlistPanel({ isOpen, onClose, inline = false }: Props) {
  const { toast } = useToast()
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
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState<SymbolResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const { openPosition } = useTrading()
  const { setSelectedSymbol, marketData } = useMarket()

  type CreatePositionLike = Record<string, unknown>

  const quickOrder = async (symbol: string, side: 'buy' | 'sell') => {
    try {
      setLoading(prev => ({ ...prev, [symbol]: true }))
      // For quick orders we send a market order with 0.01 lots by default
      const payload: CreatePositionLike = {
        symbolId: symbol,
        side,
        lotSize: 0.01,
        orderType: 'market',
        triggerPrice: null,
        stopLoss: null,
        takeProfit: null,
        comment: `Quick ${side.toUpperCase()} ${symbol}`
      }

      await openPosition(payload)
      toast({ title: `Order placed`, description: `${side.toUpperCase()} ${symbol}` })
    } catch (err) {
      toast({ title: 'Order error', description: String(err), variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }))
    }
  }

  // Persist watchlist symbols to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('watchlist_symbols', JSON.stringify(symbols))
      }
    } catch {
      // ignore
    }
  }, [symbols])

  // Search backend symbols when query debounces
  useEffect(() => {
    let cancelled = false
    const doSearch = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }
      setSearchLoading(true)
      try {
        const res = await marketService.searchSymbols(debouncedQuery.trim())
        if (!cancelled) {
          // response shape may vary: try several fields
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const results = (res?.symbols) || (res?.data?.symbols) || (Array.isArray(res) ? res : [])
          setSearchResults(results)
        }
      } catch {
        if (!cancelled) setSearchResults([])
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }

    doSearch()

    return () => { cancelled = true }
  }, [debouncedQuery])

  const addSymbolToWatchlist = (r: { symbol: string }) => {
    const sym = (r.symbol || '').toUpperCase()
    if (!sym) return
    if (symbols.includes(sym)) {
      toast({ title: 'Already in watchlist', description: sym })
      return
    }
    setSymbols(prev => [sym, ...prev].slice(0, 100))
    toast({ title: 'Added to watchlist', description: sym })
    setSearchQuery('')
    setSearchResults([])
  }

  const removeSymbolFromWatchlist = (sym: string) => {
    setSymbols(prev => prev.filter(s => s !== sym))
  }

  // Inline mode: render as a docked panel (no backdrop/fixed positioning)
  if (inline) {
    // Inline mode - but on small screens we prefer overlay/drawer behavior.
    return (
      <div aria-hidden={!isOpen} className={`w-full h-full ${isOpen ? 'block' : 'hidden'}`} role="region" aria-label="Watchlist panel">
        <div className="relative h-full">
          {/* Vertical close tab attached to the left edge of the panel */}
          <button
            type="button"
            aria-label="Close wishlist"
            onClick={onClose}
            className="absolute -left-3 top-1/2 -translate-y-1/2 h-16 w-6 flex items-center justify-center bg-gradient-to-br from-gray-700/90 to-black/80 rounded-r shadow-lg hover:from-gray-600/90 hover:to-gray-700/80 z-50 border border-gray-600/40"
            style={{
              boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(255,255,255,0.1), 2px 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <ChevronRight className="w-3 h-3 text-gray-200 drop-shadow-sm" />
          </button>

          <Card className="flex flex-col bg-gradient-to-br from-gray-900/95 to-black/90 backdrop-blur-md border-l border-gray-600/50 h-full shadow-2xl"
                style={{
                  boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.4), inset -2px -2px 8px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.3)"
                }}>
            {/* Compact Header */}
            <div className="px-2 py-1.5 flex items-center justify-between border-b border-gray-600/40 bg-gradient-to-r from-gray-800/40 to-black/30">
              <h3 className="font-bold text-xs text-gray-100 drop-shadow-sm tracking-wide">WATCHLIST</h3>
              <div className="flex items-center gap-1">
                <input
                  aria-label="Search symbols"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-2 py-1 rounded text-xs bg-gradient-to-r from-gray-700/60 to-black/40 border border-gray-600/50 text-gray-200 placeholder-gray-500 w-20 focus:w-32 transition-all duration-200"
                />
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-700/50 text-gray-400 hover:text-white p-1">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Compact Symbol List */}
            <div className="flex-1 px-1 py-1 space-y-1 overflow-auto bg-gradient-to-br from-gray-800/30 to-black/50">
              {searchQuery.trim().length >= 2 ? (
                searchLoading ? (
                  <div className="text-xs text-gray-400 p-2 text-center">Searching...</div>
                ) : (
                  searchResults.length ? (
                    searchResults.map((r: SymbolResult) => (
                      <div key={r.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-black/70 border border-transparent hover:border-gray-600/40 transition-all duration-200 group">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-gray-200 truncate drop-shadow-sm">{r.symbol}</div>
                          <div className="text-[10px] text-gray-500 truncate">{r.name}</div>
                        </div>
                        <Button size="sm" onClick={() => addSymbolToWatchlist(r)} className="bg-gradient-to-r from-gray-600 to-black hover:from-gray-500 hover:to-gray-700 text-white border border-gray-500 text-xs px-2 py-1 h-6">+</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 p-2 text-center">No results</div>
                  )
                )
              ) : (
                symbols.map((s) => {
                  const md = marketData.find(m => m.symbol === s)
                  const price = md?.currentPrice ?? md?.closePrice ?? 0
                  const symbolId = md?.symbolId ?? null
                  const bid = md?.bid ?? null
                  const ask = md?.ask ?? null
                  const fmt = (v: number | null | undefined) => (typeof v === 'number' ? v.toFixed(4) : '-')
                  return (
                    <div key={s} className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-black/70 border border-transparent hover:border-gray-600/40 transition-all duration-200">
                      {/* Line 1: name (left) and current price (right) */}
                      <div className="flex items-center justify-between min-w-0 cursor-pointer" onClick={() => { setSelectedSymbol(s); onClose(); }}>
                        <div className="font-semibold text-sm text-gray-100 truncate mr-2">{s}</div>
                        <div className="font-mono text-xs text-gray-200 ml-2 truncate">{price}</div>
                      </div>

                      {/* Line 2: Bid and Ask */}
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-emerald-400 truncate">Bid: <span className="font-mono text-gray-300">{fmt(bid)}</span></span>
                          <span className="text-rose-400 truncate">Ask: <span className="font-mono text-gray-300">{fmt(ask)}</span></span>
                        </div>
                        <div className="text-xs text-gray-400" />
                      </div>

                      {/* Line 3: actions (Buy / Sell) and remove */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <TradeDialog symbol={s} symbolId={symbolId ?? 0} price={String(ask ?? price)} type="buy">
                            <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white border border-emerald-500 text-sm px-3 py-1.5 h-7">Buy</Button>
                          </TradeDialog>
                          <TradeDialog symbol={s} symbolId={symbolId ?? 0} price={String(bid ?? price)} type="sell">
                            <Button size="sm" variant="destructive" className="px-3 py-1 text-sm h-7">Sell</Button>
                          </TradeDialog>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" className="p-1" aria-label={`Remove ${s}`} onClick={() => removeSymbolFromWatchlist(s)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Default (overlay) mode - constrained to parent (chart) by using absolute positioning
  return (
    <div aria-hidden={!isOpen} className={`absolute inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`} role="dialog" aria-modal={isOpen}>
      {/* Backdrop for small opacity when open */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

  <div className={`absolute right-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: 'clamp(320px, 30%, 420px)', top: '0', height: '100%' }}>
        <Card className="flex flex-col bg-gradient-to-br from-gray-900/95 to-black/90 backdrop-blur-md border-l border-gray-600/50 h-full shadow-2xl"
              style={{
                boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.4), inset -2px -2px 8px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.3)"
              }}>
          {/* Compact Header */}
          <div className="p-2 flex items-center justify-between border-b border-gray-600/40 bg-gradient-to-r from-gray-800/40 to-black/30">
            <h3 className="font-bold text-sm text-gray-100 drop-shadow-sm tracking-wide">WATCHLIST</h3>
            <div className="flex items-center gap-2">
              <input
                aria-label="Search symbols"
                placeholder="Search symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 py-1 rounded text-sm bg-gradient-to-r from-gray-700/60 to-black/40 border border-gray-600/50 text-gray-200 placeholder-gray-500 w-24 focus:w-36 transition-all duration-200"
              />
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-700/50 text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Compact Symbol List */}
          <div className="flex-1 p-2 space-y-1 overflow-auto bg-gradient-to-br from-gray-800/30 to-black/50">
            {searchQuery.trim().length >= 2 ? (
              searchLoading ? (
                <div className="text-sm text-gray-400 p-2 text-center">Searching...</div>
              ) : (
                searchResults.length ? (
                  searchResults.map((r: SymbolResult) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-black/70 border border-transparent hover:border-gray-600/40 transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-200 truncate drop-shadow-sm">{r.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{r.name}</div>
                      </div>
                      <Button size="sm" onClick={() => addSymbolToWatchlist(r)} className="bg-gradient-to-r from-gray-600 to-black hover:from-gray-500 hover:to-gray-700 text-white border border-gray-500 text-xs px-3 py-1">Add</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm">No results</div>
                )
              )
            ) : (
              symbols.map((s) => {
                const md = marketData.find(m => m.symbol === s)
                const price = md?.currentPrice ?? md?.closePrice ?? 0
                const bid = md?.bid ?? null
                const ask = md?.ask ?? null
                const fmt = (v: number | null | undefined) => (typeof v === 'number' ? v.toString() : '-')
                return (
                  <div key={s} className="p-2 rounded-md hover:bg-muted/30">
                    {/* Line 1: name and price */}
                    <div className="flex items-center justify-between min-w-0 cursor-pointer" onClick={() => { setSelectedSymbol(s); onClose(); }}>
                      <div className="font-semibold truncate">{s}</div>
                      <div className="font-mono text-xs text-gray-200 ml-2 truncate">{price}</div>
                    </div>

                    {/* Line 2: bid / ask */}
                    <div className="flex items-center justify-between text-xs mt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-500">Bid: <span className="font-mono">{fmt(bid)}</span></span>
                        <span className="text-rose-500">Ask: <span className="font-mono">{fmt(ask)}</span></span>
                      </div>
                      <div />
                    </div>

                    {/* Line 3: actions */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => quickOrder(s, 'buy')} disabled={!!loading[s]}>Buy</Button>
                        <Button size="sm" variant="destructive" className="px-3 py-1 text-sm" onClick={() => quickOrder(s, 'sell')} disabled={!!loading[s]}>Sell</Button>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1" aria-label={`Remove ${s}`} onClick={() => removeSymbolFromWatchlist(s)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
