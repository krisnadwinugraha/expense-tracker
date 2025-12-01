// src/types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string | null
    roles: Array<{
      id: number
      name: string
      permissions: Array<{
        action: string
        subject: string
      }>
    }>
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      roles: Array<{
        id: number
        name: string
        permissions: Array<{
          action: string
          subject: string
        }>
      }>
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    roles: Array<{
      id: number
      name: string
      permissions: Array<{
        action: string
        subject: string
      }>
    }>
  }
}
