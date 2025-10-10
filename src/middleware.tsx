// middleware.js
export { default } from 'next-auth/middleware'

// This config specifies which routes should be protected
export const config = {
  matcher: [
    '/', // Protect the homepage/dashboard
    '/another-protected-route/:path*'
  ]
}
