"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, DollarSign, Package, Building2, Hash, Tag, Users, BookCheck, AlertCircle } from "lucide-react"
import type { Book } from "@/lib/api"
interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onReserve: (bookId: string) => void
  loading?: boolean
  userProfile?: any // Add user profile to check limits
}

export function BookDetailsModal({
  book,
  isOpen,
  onClose,
  onReserve,
  loading = false,
  userProfile,
}: BookDetailsModalProps) {
  if (!book) return null

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

  // Check if user can borrow more books
  const canUserBorrowMore = userProfile?.can_borrow_more !== false
  const userBooksCount = (userProfile?.borrowed_books_count || 0) + (userProfile?.requested_books_count || 0)
  const maxBooks = userProfile?.max_books_allowed || 4

  const handleReserve = async () => {
    await onReserve(book.id)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-xl font-bold line-clamp-2">{book.title}</DialogTitle>
                <DialogDescription className="text-base mt-1">by {book.author}</DialogDescription>
              </div>
              <Badge className={getStatusColor(book.status)}>{getStatusText(book.status)}</Badge>
            </div>
          </DialogHeader>

          {/* Book Image Section */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
              {book.cover_image || book.featured_image ? (
                <img
                  src={book.cover_image || book.featured_image}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/placeholder.svg?height=256&width=192&text=${encodeURIComponent(book.title)}`
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="h-16 w-16 mb-2" />
                  <span className="text-sm text-center px-2">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {book.isbn && (
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">ISBN:</span>
                  <span className="text-sm">{book.isbn}</span>
                </div>
              )}

              {book.category && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Category:</span>
                  <span className="text-sm">{book.category}</span>
                </div>
              )}

              {book.publisher && (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Publisher:</span>
                  <span className="text-sm">{book.publisher}</span>
                </div>
              )}

              {book.price && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Price:</span>
                  <span className="text-sm font-semibold text-green-600">₹{book.price}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* User Borrowing Status */}
            {userProfile && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Your Borrowing Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Books in use:</span>
                    <span className="font-semibold ml-2">
                      {userBooksCount} / {maxBooks}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Available slots:</span>
                    <span className="font-semibold ml-2">{maxBooks - userBooksCount}</span>
                  </div>
                </div>
                {!canUserBorrowMore && (
                  <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                    WARNING: You have reached the maximum limit of {maxBooks} books. Please return some books before
                    borrowing more.
                  </div>
                )}
              </div>
            )}

            {/* Availability Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Book Availability
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {book.copies && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Total Copies</div>
                    <div className="text-2xl font-bold text-blue-600">{book.copies}</div>
                    <div className="text-xs text-blue-600">Total inventory</div>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Available to Borrow</div>
                  <div className="text-2xl font-bold text-green-600">{book.books_available || 0}</div>
                  <div className="text-xs text-green-600">Books in library</div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Currently Borrowed</div>
                  <div className="text-2xl font-bold text-red-600">{book.books_issued || 0}</div>
                  <div className="text-xs text-red-600">Books issued to students</div>
                </div>
              </div>

              {book.total_issued_books && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded flex items-center">
                  <BookCheck className="h-4 w-4 mr-2" />
                  <strong>Status:</strong>&nbsp;{book.total_issued_books}
                </div>
              )}

              {/* Availability Summary */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Availability Summary</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  {book.books_available && book.books_available > 0 ? (
                    <span className="text-green-700 font-medium">
                      {book.books_available} book{book.books_available !== 1 ? "s" : ""} available to borrow
                    </span>
                  ) : (
                    <span className="text-red-700 font-medium">
                      No books available - All {book.books_issued || 0} copies are currently borrowed by students
                    </span>
                  )}
                </div>
              </div>
            </div>

            {book.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="flex-1"
                disabled={
                  !isBookAvailable(book.status) || loading || (book.books_available || 0) === 0 || !canUserBorrowMore
                }
                onClick={handleReserve}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {!canUserBorrowMore
                  ? "Borrowing Limit Reached"
                  : isBookAvailable(book.status) && (book.books_available || 0) > 0
                    ? "Reserve Book"
                    : "Not Available"}
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial bg-transparent">
                Close
              </Button>
            </div>

            {/* Warning Messages */}
            {!canUserBorrowMore && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <div>
                  <strong>Borrowing Limit Reached:</strong> You have {userBooksCount} books (borrowed + requested) out
                  of the maximum {maxBooks} allowed. Please return some books before borrowing more.
                </div>
              </div>
            )}

            {(book.books_available || 0) === 0 && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded flex items-center">
                <BookCheck className="h-4 w-4 mr-2" />
                <div>
                  <strong>Note:</strong> All copies are currently borrowed by students.
                  {book.books_issued && book.books_issued > 0 && (
                    <span>
                      {" "}
                      {book.books_issued} book{book.books_issued !== 1 ? "s are" : " is"} currently issued.
                    </span>
                  )}{" "}
                  Please check back later or contact the library.
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
