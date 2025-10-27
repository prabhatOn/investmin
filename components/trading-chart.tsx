"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { useMarket } from "@/contexts/MarketContext"
import { useHistoricalData } from "@/hooks/use-trading"
import TradingViewChart from "./trading-view-chart"
import { Toaster } from "@/components/ui/toaster"

const DEFAULT_TIMEFRAME = '1h'

export default function TradingChart() {
  const { selectedSymbol, marketData, isLoading: marketLoading } = useMarket()

  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME)
  

  useEffect(() => {
    // simple debug logging
    // console.log('TradingChart - selectedSymbol:', selectedSymbol)
  }, [selectedSymbol, marketData, marketLoading])

  const currentSymbolData = marketData.find(item => item.symbol === selectedSymbol) || null

  const {
    error: historyError,
    refetch: refetchHistory
  } = useHistoricalData(selectedSymbol, timeframe)

  // Order UI removed — no on-chart buy/sell in this version

  return (
    // Optimize height for mobile devices
    <div className="w-full h-full">
        {!selectedSymbol ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Activity className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Select a trading symbol to view chart</p>
            </div>
          </div>
        ) : historyError && !currentSymbolData ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-red-500 mb-2 text-sm sm:text-base">Error loading chart data</p>
              <button className="px-2 py-1 sm:px-3 sm:py-1 border rounded text-xs sm:text-sm" onClick={refetchHistory}>Retry</button>
            </div>
          </div>
        ) : (
      <div className="w-full h-full">
        <div style={{ height: '100%' }}><TradingViewChart symbol={selectedSymbol || 'EURUSD'} timeframe={timeframe} onBuy={()=>{}} onSell={()=>{}} onChangeTimeframe={setTimeframe} /></div>
      </div>
        )}
      <Toaster />
    </div>
  )
}