"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, User, Calendar, Search, LogOut, Settings } from "lucide-react"
import { BookSearch } from "./book-search"
import { UserProfile } from "./user-profile"
import { BorrowedBooks } from "./borrowed-books"
import { Reservations } from "./reservations"
import { ApiConfigDebug } from "@/components/debug/api-config-debug"
import { ENV } from "@/lib/config"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("search")

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-900 mr-3" />
              <div>
                {/* Show LMS on mobile, full title on desktop */}
                <h1 className="text-xl font-bold text-gray-900">
                  <span className="block sm:hidden">LMS</span>
                  <span className="hidden sm:block">Library Management System</span>
                </h1>
                <p className="text-sm text-gray-600">Digital Library Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">ID: {user?.uid}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search Books</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Borrowed</span>
              <span className="sm:hidden">Books</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reservations</span>
              <span className="sm:hidden">Reserved</span>
            </TabsTrigger>
            {ENV.IS_DEVELOPMENT && (
              <TabsTrigger value="debug" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Debug</span>
                <span className="sm:hidden">Debug</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Library Books</h2>
              <p className="text-gray-600 mb-6">Find and reserve books from our digital collection</p>
              <BookSearch />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
              <p className="text-gray-600 mb-6">View your account information and library statistics</p>
              <UserProfile />
            </div>
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Borrowed Books</h2>
              <p className="text-gray-600 mb-6">Manage your currently borrowed books</p>
              <BorrowedBooks />
            </div>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Reservations</h2>
              <p className="text-gray-600 mb-6">View and manage your book reservations</p>
              <Reservations />
            </div>
          </TabsContent>
          {ENV.IS_DEVELOPMENT && (
            <TabsContent value="debug" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Debug Information</h2>
                <p className="text-gray-600 mb-6">Development tools and API configuration</p>
                <ApiConfigDebug />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard
