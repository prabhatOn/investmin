'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, TrendingUp, Sun, Moon, Shield, Lock, User, Mail, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Get redirect URL from URL params
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('redirect') || '/'
    }
    return '/'
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = getRedirectUrl()
      
      console.log('Login useEffect - User:', user)
      console.log('Login useEffect - User role:', user.role)
      console.log('Login useEffect - User roles array:', user.roles)
      console.log('Login useEffect - Is admin?', user.role?.toLowerCase() === 'admin')
      console.log('Login useEffect - Redirect URL:', redirectUrl)
      
      // If user is admin, redirect to admin dashboard
      if (user.role?.toLowerCase() === 'admin') {
        console.log('Redirecting admin to:', redirectUrl.startsWith('/admin') ? redirectUrl : '/admin')
        if (redirectUrl.startsWith('/admin')) {
          router.replace(redirectUrl)
        } else {
          router.replace('/admin')
        }
      } else {
        console.log('Redirecting regular user to:', redirectUrl)
        router.replace(redirectUrl)
      }
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      toast.error("Please fix the validation errors", {
        description: "Check your email and password fields",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await login(email, password)
      
      // Success toast
      toast.success("Login successful!", {
        description: `Welcome back, ${response.user.firstName || response.user.email}!`,
        duration: 3000,
        icon: <CheckCircle className="w-4 h-4" />,
      })
      
      // Check if user is admin and redirect accordingly
      const redirectUrl = getRedirectUrl()
      const userRole = response?.user?.role
      
      console.log('Login handleSubmit - Full response:', response)
      console.log('Login handleSubmit - User:', response?.user)
      console.log('Login handleSubmit - User role:', userRole)
      console.log('Login handleSubmit - User roles array:', response?.user?.roles)
      console.log('Login handleSubmit - Redirect URL:', redirectUrl)
      console.log('Login handleSubmit - Is admin?', userRole?.toLowerCase() === 'admin')
      
      // If user is admin, always redirect to admin dashboard (unless specifically requesting another admin page)
      if (userRole?.toLowerCase() === 'admin') {
        console.log('Login handleSubmit - Redirecting admin to:', redirectUrl.startsWith('/admin') ? redirectUrl : '/admin')
        if (redirectUrl.startsWith('/admin')) {
          router.replace(redirectUrl)
        } else {
          router.replace('/admin')
        }
      } else {
        console.log('Login handleSubmit - Redirecting regular user to:', redirectUrl)
        // For non-admin users, redirect to the requested URL or dashboard
        router.replace(redirectUrl)
      }
    } catch (err: unknown) {
      let errorMessage = "Login failed. Please try again."
      let errorDescription = ""
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase()
        
        if (message.includes("invalid email or password")) {
          errorMessage = "Invalid credentials"
          errorDescription = "The email or password you entered is incorrect"
        } else if (message.includes("user not found") || message.includes("account not found")) {
          errorMessage = "Account not found"
          errorDescription = "No account exists with this email address"
        } else if (message.includes("account is not active") || message.includes("suspended")) {
          errorMessage = "Account suspended"
          errorDescription = "Your account has been suspended. Please contact support."
        } else if (message.includes("email not verified")) {
          errorMessage = "Email not verified"
          errorDescription = "Please verify your email address before logging in"
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Connection error"
          errorDescription = "Please check your internet connection and try again"
        } else if (message.includes("rate limit") || message.includes("too many")) {
          errorMessage = "Too many attempts"
          errorDescription = "Please wait a few minutes before trying again"
        } else {
          errorMessage = "Login failed"
          errorDescription = err.message
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
        icon: <XCircle className="w-4 h-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const demoCredentials = [
    { label: "Demo User", email: "test@example.com", password: "password123" },
    { label: "Admin User", email: "admin@tradepro.com", password: "password123" }
  ]

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setEmailError("")
    setPasswordError("")
    toast.info("Demo credentials filled", {
      description: "You can now click 'Sign In' to continue",
      duration: 2000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-gray-700 to-black rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-gray-800/50 bg-gray-900/80 backdrop-blur-sm shadow-lg border border-gray-700"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-300" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-300" />
          </Button>
        </div>

        {/* Logo/Brand */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-gray-600/50 overflow-hidden">
              <Image 
                src="/logo_mi.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            TradePro
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Professional Trading Platform</p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Secure & Encrypted</span>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border shadow-2xl border-gray-700/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-gray-400">Sign in to your trading account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) validateEmail(e.target.value)
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="Enter your email address"
                    className={`bg-gray-800/50 border-2 transition-all duration-200 pl-10 text-white placeholder-gray-500 ${
                      emailError 
                        ? 'border-red-500 focus:border-red-500' 
                        : email && !emailError 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-gray-600 focus:border-gray-400'
                    }`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  {email && !emailError && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <XCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) validatePassword(e.target.value)
                    }}
                    onBlur={() => validatePassword(password)}
                    placeholder="Enter your password"
                    className={`bg-gray-800/50 border-2 transition-all duration-200 pl-10 pr-10 text-white placeholder-gray-500 ${
                      passwordError 
                        ? 'border-red-500 focus:border-red-500' 
                        : password && !passwordError 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-gray-600 focus:border-gray-400'
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <XCircle className="w-3 h-3" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-black hover:from-gray-600 hover:to-gray-900 text-white font-semibold py-6 text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 border border-gray-600"
                disabled={isLoading || !!emailError || !!passwordError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-3" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-200 mb-4 text-center">Demo Accounts</h3>
              <div className="space-y-3">
                {demoCredentials.map((demo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-200">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-200">{demo.label}</div>
                      <div className="text-xs text-gray-400 font-mono">{demo.email}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(demo.email, demo.password)}
                      className="text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white"
                    >
                      Use Account
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center p-4 bg-gray-800/20 rounded-lg border border-gray-700/50">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/register" 
                  className="text-gray-200 hover:text-white font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Join thousands of traders worldwide
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            © 2025 TradePro. Professional Trading Platform.
          </p>
          <p className="text-xs text-gray-500">
            Powered by advanced encryption and real-time security
          </p>
        </div>
      </div>
    </div>
  )
}