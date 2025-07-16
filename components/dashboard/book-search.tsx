"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, BookOpen, Loader2, Filter, X, RefreshCw, AlertCircle, Eye, User, Hash, Sparkles } from "lucide-react"
import { libraryAPI, type Book } from "@/lib/api"
import { BookDetailsModal } from "./book-details-modal"
import { BookSearchSkeleton } from "./book-search-skeleton"
import { SearchLoadingState, BookGridLoadingState, LoadingSpinner } from "./loading-states"

interface SearchSuggestion {
  type: "title" | "author" | "isbn"
  value: string
  book?: Book
}

export function BookSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [allBooks, setAllBooks] = useState<Book[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  // Load user profile along with initial data
  const loadInitialData = async () => {
    setInitialLoading(true)
    try {
      // Load categories, books, and user profile in parallel
      await Promise.all([loadCategories(), loadAllBooks(), searchBooks(), loadUserProfile()])
    } catch (error) {
      console.error("Failed to load initial data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  // Add function to load user profile
  const loadUserProfile = async () => {
    try {
      const profile = await libraryAPI.getUserProfile()
      setUserProfile(profile)
      console.log("SUCCESS: User profile loaded:", profile)
    } catch (error) {
      console.warn("Failed to load user profile:", error.message)
    }
  }

  const loadAllBooks = async () => {
    try {
      // Make sure we're authenticated before loading books
      const books = await libraryAPI.getBooks({ limit: 1000 })
      setAllBooks(books)
      console.log(`SUCCESS: Loaded ${books.length} books for suggestions`)
    } catch (error) {
      console.warn("Failed to load all books for suggestions:", error)
      // Set empty array to prevent further attempts
      setAllBooks([])
    }
  }

  const loadCategories = async () => {
    try {
      console.log("SEARCH: Loading categories...")
      const cats = await libraryAPI.getCategoriesList()
      console.log("SUCCESS: Categories loaded:", cats)
      setCategories(cats)
    } catch (error) {
      console.warn("ERROR: Categories loading failed:", error.message)
      // Set minimal fallback categories
      setCategories(["Fiction", "Non-Fiction", "Science", "Technology"])
    }
  }

  // Generate search suggestions
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (!query || query.length < 2) return []

    const lowerQuery = query.toLowerCase()
    const suggestions: SearchSuggestion[] = []
    const seen = new Set<string>()

    // Search through all books
    allBooks.forEach((book) => {
      // Title suggestions
      if (book.title.toLowerCase().includes(lowerQuery) && !seen.has(book.title.toLowerCase())) {
        suggestions.push({
          type: "title",
          value: book.title,
          book,
        })
        seen.add(book.title.toLowerCase())
      }

      // Author suggestions
      if (book.author.toLowerCase().includes(lowerQuery) && !seen.has(book.author.toLowerCase())) {
        suggestions.push({
          type: "author",
          value: book.author,
          book,
        })
        seen.add(book.author.toLowerCase())
      }

      // ISBN suggestions
      if (book.isbn && book.isbn.includes(query) && !seen.has(book.isbn)) {
        suggestions.push({
          type: "isbn",
          value: book.isbn,
          book,
        })
        seen.add(book.isbn)
      }
    })

    // Sort suggestions by relevance (exact matches first, then partial)
    return suggestions
      .sort((a, b) => {
        const aExact = a.value.toLowerCase().startsWith(lowerQuery)
        const bExact = b.value.toLowerCase().startsWith(lowerQuery)
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return a.value.length - b.value.length
      })
      .slice(0, 8) // Limit to 8 suggestions
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSelectedSuggestionIndex(-1)

    if (value.length >= 2) {
      setSuggestionLoading(true)
      // Debounce suggestions
      const timer = setTimeout(() => {
        const newSuggestions = generateSuggestions(value)
        setSuggestions(newSuggestions)
        setShowSuggestions(newSuggestions.length > 0)
        setSuggestionLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionLoading(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        searchBooksWithField("all")
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex])
        } else {
          searchBooksWithField("all")
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Select a suggestion
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    // Auto-search when suggestion is selected with specific field
    setTimeout(() => searchBooksWithField(suggestion.type), 100)
  }

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // New function to search with specific field
  const searchBooksWithField = async (searchField: "title" | "author" | "isbn" | "all" = "all", newPage = 1) => {
    setLoading(true)
    setError(null)
    setHasSearched(true)
    setShowSuggestions(false) // Hide suggestions when searching

    try {
      console.log("SEARCH: Searching books with params:", {
        search: searchQuery || undefined,
        searchField: searchField,
        category: category === "all" ? undefined : category,
        page: newPage,
        limit: 12,
      })

      // Calculate offset for pagination
      const offset = (newPage - 1) * 12

      const books = await libraryAPI.getBooks({
        search: searchQuery || undefined,
        searchField: searchField,
        category: category === "all" ? undefined : category,
        page: newPage,
        limit: 12,
        offset: offset, // Add offset parameter
      })

      console.log("SUCCESS: Received books for page", newPage, ":", books.length)

      setBooks(books)
      setTotalBooks(books.length) // This represents books on current page
      setPage(newPage)

      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (apiError) {
      console.error("ERROR: Books API error:", apiError)

      let errorMessage = "Failed to load books"
      if (apiError.status === 404) {
        errorMessage = "Book data not available - some endpoints may not be configured"
      } else if (apiError.status === 401 || apiError.status === 403) {
        errorMessage = "Authentication failed - please login again"
      } else {
        errorMessage = `Failed to load books: ${apiError.message}`
      }

      setError(errorMessage)
      setBooks([])
      setTotalBooks(0)
    }

    setLoading(false)
  }

  // Update the regular searchBooks function to use "all" field search
  const searchBooks = async (newPage = 1) => {
    return searchBooksWithField("all", newPage)
  }

  // Update the handleReserve function to show calendar modal after successful reservation
  const handleReserve = async (bookId: string) => {
    try {
      setLoading(true)

      console.log(`REQUEST: Starting reservation process for book ID: ${bookId}`)

      // Check borrowing eligibility first
      const eligibility = await libraryAPI.checkBorrowingEligibility()

      if (!eligibility.can_borrow) {
        alert(`Cannot reserve book: ${eligibility.message}`)
        return
      }

      console.log(`SUCCESS: User is eligible to borrow. Proceeding with reservation...`)

      const result = await libraryAPI.reserveBook(bookId)

      if (result.success) {
        // Refresh the books list to show updated availability
        await searchBooks(page)

        // Show success message
        alert(`SUCCESS: ${result.message}`)

        // Close details modal if open
        setShowDetailsModal(false)

        console.log(`SUCCESS: Book reservation completed successfully`)
      } else {
        alert(`ERROR: Reservation failed: ${result.message}`)
        console.error(`ERROR: Reservation failed:`, result.message)
      }
    } catch (error) {
      console.error("ERROR: Reservation process failed:", error)
      alert("ERROR: Reservation failed. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetails = (book: Book) => {
    setSelectedBook(book)
    setShowDetailsModal(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setCategory("all")
    setShowSuggestions(false)
    setSuggestions([])
    setPage(1) // Reset to first page
    searchBooks(1) // Start from page 1
  }

  const refreshBooks = () => {
    searchBooks(page) // Keep current page when refreshing
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case "available":
        return "bg-green-100 text-green-800"
      case "borrowed":
        return "bg-red-100 text-red-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case "available":
        return "Available"
      case "borrowed":
        return "Borrowed"
      case "reserved":
        return "Reserved"
      default:
        return status || "Available"
    }
  }

  const isBookAvailable = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    return normalizedStatus === "available" || !status
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "author":
        return <User className="h-4 w-4 text-blue-500" />
      case "isbn":
        return <Hash className="h-4 w-4 text-green-500" />
      default:
        return <BookOpen className="h-4 w-4 text-purple-500" />
    }
  }

  // Show initial loading skeleton
  if (initialLoading) {
    return <BookSearchSkeleton count={6} />
  }

  return (
    <div className="space-y-4">
      {/* Compact Search Card */}
      <Card className="border border-gray-300 shadow-sm bg-white">
        <CardContent className="p-4 lg:p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-900" />
              <span className="font-semibold text-gray-900">Search Library</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Total Resources: <span className="font-semibold">{allBooks.length.toLocaleString()}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshBooks}
                disabled={loading}
                className="h-8 w-8 p-0 bg-transparent"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                ref={searchInputRef}
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                className="pl-10 pr-10 h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                autoComplete="off"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    setSearchQuery("")
                    setShowSuggestions(false)
                    setSuggestions([])
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                >
                  {suggestionLoading ? (
                    <div className="p-3 text-center text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      <span className="text-sm">Finding suggestions...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <Sparkles className="h-3 w-3" />
                          Suggestions
                        </div>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.type}-${suggestion.value}`}
                          className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-b-0 flex items-center gap-3 transition-colors ${
                            index === selectedSuggestionIndex ? "bg-blue-50" : ""
                          }`}
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          <div className="flex-shrink-0">{getSuggestionIcon(suggestion.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">{suggestion.value}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type === "isbn" ? "ISBN" : suggestion.type.toUpperCase()}
                              </Badge>
                              {suggestion.book && suggestion.type !== "title" && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{suggestion.book.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                      <div className="text-sm">No suggestions found</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => searchBooksWithField("all")}
                  disabled={loading}
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>

                {(searchQuery || category !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="h-10 px-4 border-2 border-gray-200 hover:bg-gray-50 bg-transparent"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Search Tips */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>Titles</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Authors</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>ISBN</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <SearchLoadingState />}

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasSearched && !loading && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="text-sm text-blue-900">
            {totalBooks > 0 ? (
              <>
                Found "<span className="font-semibold">{totalBooks}</span>" book{totalBooks !== 1 ? "s" : ""}
                {searchQuery && (
                  <>
                    {" "}
                    for "<span className="font-medium">{searchQuery}</span>"
                  </>
                )}
                {category !== "all" && (
                  <>
                    {" "}
                    in <span className="font-medium">{category}</span>
                  </>
                )}
              </>
            ) : (
              "No books found matching your criteria"
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading ? (
        <BookGridLoadingState count={6} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  {/* Book Image */}
                  <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 mr-3">
                    {book.cover_image || book.featured_image ? (
                      <img
                        src={book.cover_image || book.featured_image}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=80&width=64&text=${encodeURIComponent(book.title.substring(0, 10))}`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className={getStatusColor(book.status)}>{getStatusText(book.status)}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {book.isbn && <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>}
                  <p className="text-sm text-gray-600">Category: {book.category || ""}</p>
                  {book.publisher && <p className="text-sm text-gray-600">Publisher: {book.publisher}</p>}
                  {book.price && <p className="text-sm text-gray-600 font-semibold">Price: ₹{book.price}</p>}

                  {/* Simplified Availability Info - Only Available count */}
                  <div className="flex justify-end text-sm">
                    <span className="text-green-600 font-medium">Available: {book.books_available || 0}</span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {/* Update the Reserve button in the book cards to check borrowing limits */}
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={
                        !isBookAvailable(book.status) ||
                        loading ||
                        (book.books_available || 0) === 0 ||
                        userProfile?.can_borrow_more === false
                      }
                      onClick={() => handleReserve(book.id)}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : userProfile?.can_borrow_more === false ? (
                        "Limit Reached"
                      ) : isBookAvailable(book.status) && (book.books_available || 0) > 0 ? (
                        "Reserve"
                      ) : (
                        "Unavailable"
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShowDetails(book)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {books.length === 0 && hasSearched && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No books found</p>
            <p className="text-sm text-gray-400">Try adjusting your search criteria or browse all books</p>
            <Button variant="outline" onClick={clearSearch} className="mt-4 bg-transparent">
              Browse All Books
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {(totalBooks > 12 || page > 1) && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => searchBooksWithField("all", page - 1)}
              size="sm"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Previous"}
            </Button>

            <div className="flex items-center gap-1">
              {page > 2 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => searchBooksWithField("all", 1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </Button>
                  {page > 3 && <span className="text-gray-400">...</span>}
                </>
              )}

              {page > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => searchBooksWithField("all", page - 1)}
                  className="h-8 w-8 p-0"
                >
                  {page - 1}
                </Button>
              )}

              <Button variant="default" size="sm" className="h-8 w-8 p-0">
                {page}
              </Button>

              {books.length === 12 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => searchBooksWithField("all", page + 1)}
                  className="h-8 w-8 p-0"
                >
                  {page + 1}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              disabled={loading || books.length < 12}
              onClick={() => searchBooksWithField("all", page + 1)}
              size="sm"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Next"}
            </Button>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      {hasSearched && !loading && books.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing page {page} • {books.length} books on this page
          {books.length === 12 && " • More books available"}
        </div>
      )}

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onReserve={handleReserve}
        loading={loading}
        userProfile={userProfile}
      />
    </div>
  )
}
