# Praya Labs - Library Management System PWA

Given by - Praya Labs

Developed by : Usham Roy

Progressive Web Application for library management built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Book Management**: Search, browse, and reserve books
- **User Authentication**: Secure login with session management
- **Progressive Web App**: Works offline and can be installed on devices
- **Advanced Search**: Search by title, author, ISBN with smart suggestions
- **User Dashboard**: Track borrowed books, reservations, and due dates
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Security**: CSRF protection, secure authentication, and session management

## Environment Configuration

The application uses environment variables for configuration. All API URLs and settings are centralized and configurable.

### Required Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# API Configuration
NEXT_PUBLIC_LIBRARY_API_URL=https://your-api-domain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Library Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

### Environment Setup

1. **Copy the example environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Update the API URL:**
   \`\`\`env
   NEXT_PUBLIC_LIBRARY_API_URL=https://lib.prayalabs.com
   \`\`\`

3. **Restart the development server** to apply changes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the library API endpoint

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd library-pwa
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   \`\`\`

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration Management

### API Configuration

All API endpoints are centrally managed in `lib/config.ts`:

\`\`\`typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_LIBRARY_API_URL,
  ENDPOINTS: {
    LOGIN: "/web/user/login",
    BOOKS: "/web/jsonapi/lmsbook/lmsbook",
    // ... other endpoints
  }
}
\`\`\`

### Changing API URLs

To change the API URL:

1. Update `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_LIBRARY_API_URL=https://new-api-domain.com
   \`\`\`

2. Restart the development server
3. All API calls will automatically use the new URL

### Debug Tools

In development mode, access the debug panel to:
- Test API connections
- View current configuration
- Monitor API requests
- Validate environment variables

## Project Structure

\`\`\`
library-pwa/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login-error/       # Error pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── debug/            # Debug tools
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── config.ts         # Configuration management
│   ├── api.ts            # API client
│   └── api-client.ts     # HTTP client utilities
├── public/               # Static assets
├── .env.example          # Environment template
└── .env.local           # Local environment (create this)
\`\`\`

## API Integration

### Authentication

The system uses HTTP Basic Authentication with CSRF protection:

\`\`\`typescript
// Login with credentials
const result = await libraryAPI.login(username, password, sessionId)

// All subsequent requests include authentication headers
const books = await libraryAPI.getBooks()
\`\`\`

### Book Management

\`\`\`typescript
// Search books
const books = await libraryAPI.getBooks({
  search: "javascript",
  searchField: "title",
  category: "Technology",
  page: 1,
  limit: 12
})

// Reserve a book
const result = await libraryAPI.reserveBook(bookId)
\`\`\`

### User Management

\`\`\`typescript
// Get user profile
const profile = await libraryAPI.getUserProfile()

// Get borrowed books
const borrowedBooks = await libraryAPI.getUserBorrowedBooks()

// Check borrowing eligibility
const eligibility = await libraryAPI.checkBorrowingEligibility()
\`\`\`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Style

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

### Adding New Features

1. **API Integration**: Add endpoints to `lib/config.ts`
2. **Components**: Create in appropriate `components/` subdirectory
3. **Types**: Define in relevant files or `lib/types.ts`
4. **Styling**: Use Tailwind CSS classes

## Deployment

### Environment Variables

Set the following environment variables in your deployment platform:

\`\`\`env
NEXT_PUBLIC_LIBRARY_API_URL=https://your-production-api.com
NEXT_PUBLIC_APP_NAME=Library Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

### Build and Deploy

\`\`\`bash
# Build the application
npm run build

# Start production server
npm run start
\`\`\`

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## PWA Features

### Installation

Users can install the app on their devices:
- **Desktop**: Click install button in browser
- **Mobile**: Add to home screen option

### Offline Support

- Service worker caches essential resources
- Offline page for network failures
- Background sync for data updates

### Manifest

The app includes a web manifest for:
- Custom app icons
- Splash screen
- Display mode configuration
- Theme colors

## Security

### Authentication

- HTTP Basic Authentication for API access
- CSRF token protection for state-changing operations
- Secure session management with automatic logout

### Data Protection

- No sensitive data stored in localStorage
- Secure cookie handling
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `.env.local` file exists and has correct URL
   - Verify API endpoint is accessible
   - Check network connectivity

2. **Authentication Errors**
   - Verify credentials are correct
   - Check if API supports Basic Authentication
   - Ensure CSRF tokens are being sent

3. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Check all environment variables are set
   - Clear `.next` directory and rebuild

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
\`\`\`

This will show detailed API request/response logs in the console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub
