'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTrading } from '@/contexts/TradingContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User, CreditCard } from 'lucide-react'
import Image from 'next/image'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { activeAccount, accountSummary, isLoading: tradingLoading, accounts } = useTrading()
  const router = useRouter()
  // Theme toggle removed
  const displayFirstName = user?.first_name ?? user?.firstName ?? ''
  const displayLastName = user?.last_name ?? user?.lastName ?? ''
  const displayName = [displayFirstName, displayLastName].filter(Boolean).join(' ').trim() || 'User'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const accountNumber = activeAccount?.accountNumber
  const accountBalance = accountSummary?.balance ?? activeAccount?.balance
  const maskedAccountNumber = accountNumber ? `•••• ${accountNumber.slice(-4)}` : accounts.length ? '•••• ----' : 'No account'
  const formattedBalance = typeof accountBalance === 'number'
    ? `$${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : accounts.length ? '$0.00' : '--'
  const isAccountLoading = tradingLoading && !activeAccount

  if (!isAuthenticated) {
    return (
      <nav className="sticky top-0 z-50 border-b" style={{
        background: "linear-gradient(135deg, #111827 0%, #000000 50%, #374151 100%)",
        borderColor: "rgba(107, 114, 128, 0.4)"
      }}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <Image src="/logo_mi.png" alt="InvestMin" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold">Investmin</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-500 border-b shadow-sm" style={{
      background: "linear-gradient(135deg, #111827 0%, #000000 50%, #374151 100%)",
      borderColor: "rgba(107, 114, 128, 0.4)"
    }}>
      <div className="px-5 w-full">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image src="/logo_mi.png" alt="InvestMin" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold">Investmin</span>
          </Link>
          
          <div className="flex items-end justify-end gap-3 md:gap-6">
            <div className="hidden sm:flex flex-col items-end justify-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account</p>
              <p className="font-mono text-sm font-medium whitespace-nowrap">
                {isAccountLoading ? 'Loading...' : maskedAccountNumber}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end justify-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
              <p className="font-mono text-lg font-semibold text-trading-success whitespace-nowrap">
                {isAccountLoading ? 'Loading...' : formattedBalance}
              </p>
            </div>
            <div className="hidden sm:flex">
              <Button
                className="bg-trading-success hover:bg-trading-success/90 text-black dark:text-white"
                asChild
              >
                <Link href="/funds" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Deposit
                </Link>
              </Button>
            </div>

            {/* Profile menu (theme toggle removed) */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback>
                        {displayFirstName || displayLastName
                          ? `${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full" prefetch={true}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funds" className="w-full" prefetch={true}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Funds
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full" prefetch={true}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full" prefetch={true}>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}