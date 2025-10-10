// src/components/AuthProvider.js
'use client' // This is a crucial directive

import { SessionProvider } from 'next-auth/react'

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
