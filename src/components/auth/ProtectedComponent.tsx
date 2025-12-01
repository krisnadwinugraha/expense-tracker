// src/components/auth/ProtectedComponent.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
  roles?: string[]
  permissions?: Array<{ action: string; subject: string }>
  requireAll?: boolean
}

export function ProtectedComponent({ children, fallback = null, roles, permissions, requireAll = false }: Props) {
  const auth = useAuth()

  if (auth.isLoading) {
    return null
  }

  if (!auth.isAuthenticated) {
    return <>{fallback}</>
  }

  // Check roles
  if (roles && roles.length > 0) {
    const hasAccess = requireAll ? auth.hasAllRoles(roles) : auth.hasAnyRole(roles)

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(({ action, subject }) => auth.hasPermission(action, subject))
      : auth.hasAnyPermission(permissions)

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// src/components/auth/RoleGuard.tsx
type RoleGuardProps = {
  children: ReactNode
  roles: string[]
  fallback?: ReactNode
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  return (
    <ProtectedComponent roles={roles} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

// src/components/auth/PermissionGuard.tsx
type PermissionGuardProps = {
  children: ReactNode
  action: string
  subject: string
  fallback?: ReactNode
}

export function PermissionGuard({ children, action, subject, fallback = null }: PermissionGuardProps) {
  return (
    <ProtectedComponent permissions={[{ action, subject }]} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}
