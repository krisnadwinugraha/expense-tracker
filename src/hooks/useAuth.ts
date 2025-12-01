// src/hooks/useAuth.ts
'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

type Permission = {
  action: string
  subject: string
}

type Role = {
  id: number
  name: string
  permissions: Permission[]
}

export function useAuth() {
  const { data: session, status } = useSession()

  const authUtils = useMemo(() => {
    const roles = session?.user?.roles || []

    return {
      user: session?.user,
      isAuthenticated: !!session?.user,
      isLoading: status === 'loading',

      hasRole: (roleName: string) => {
        return roles.some(role => role.name === roleName)
      },

      hasAnyRole: (roleNames: string[]) => {
        return roleNames.some(roleName => roles.some(role => role.name === roleName))
      },

      hasAllRoles: (roleNames: string[]) => {
        return roleNames.every(roleName => roles.some(role => role.name === roleName))
      },

      hasPermission: (action: string, subject: string) => {
        return roles.some(role =>
          role.permissions.some(permission => permission.action === action && permission.subject === subject)
        )
      },

      hasAnyPermission: (permissions: Array<{ action: string; subject: string }>) => {
        return permissions.some(({ action, subject }) =>
          roles.some(role =>
            role.permissions.some(permission => permission.action === action && permission.subject === subject)
          )
        )
      }
    }
  }, [session, status])

  return authUtils
}
