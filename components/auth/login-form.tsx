"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2, Shield, Clock, User, Eye, EyeOff } from "lucide-react"
import { SecurityVerification } from "./security-verification"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [securityVerified, setSecurityVerified] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSecurityVerify = (isValid: boolean) => {
    setSecurityVerified(isValid)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!securityVerified) {
      return
    }

    setIsLoading(true)

    console.log("Login form: Submitting with", { username, password: "***", securityVerified })

    try {
      const result = await login(username, password)

      if (result.success) {
        console.log("SUCCESS: Login successful")
      } else {
        console.log("ERROR: Login failed:", result.error)
        router.push("/login-error")
      }
    } catch (error) {
      console.error("Login form error:", error)
      router.push("/login-error")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-600 rounded-lg shadow-md">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Library Management System</h1>
            <p className="text-gray-600">Institutional Access Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">User Authentication</CardTitle>
            <CardDescription className="text-gray-600">
              Please enter your credentials to access the library system
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your username"
                    className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="h-11 pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Security Verification */}
              <div className="border-t border-gray-200 pt-6">
                <SecurityVerification onVerify={handleSecurityVerify} disabled={isLoading} />
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading || !securityVerified}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Session Information */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Session Information</span>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Session Duration:</span>
                    <span className="font-medium">10 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-logout:</span>
                    <span className="font-medium">On inactivity</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security:</span>
                    <span className="font-medium">Encrypted connection</span>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure Authentication System</span>
                {securityVerified && <span className="text-green-700 font-medium ml-2">Verified</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Library Management System</p>
          <p className="mt-1">Secure Access Portal</p>
        </div>
      </div>
    </div>
  )
}
