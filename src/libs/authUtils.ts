// src/libs/authUtils.ts
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import { redirect } from 'next/navigation'

type Permission = {
  action: string
  subject: string
}

type Role = {
  id: number
  name: string
  permissions: Permission[]
}

/**
 * Check if user has a specific role
 */
export function hasRole(roles: Role[], roleName: string): boolean {
  return roles.some(role => role.name === roleName)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: Role[], roleNames: string[]): boolean {
  return roleNames.some(roleName => hasRole(roles, roleName))
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(roles: Role[], roleNames: string[]): boolean {
  return roleNames.every(roleName => hasRole(roles, roleName))
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(roles: Role[], action: string, subject: string): boolean {
  return roles.some(role =>
    role.permissions.some(permission => permission.action === action && permission.subject === subject)
  )
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(roles: Role[], permissions: Array<{ action: string; subject: string }>): boolean {
  return permissions.some(({ action, subject }) => hasPermission(roles, action, subject))
}

/**
 * Get authenticated user session or redirect to login
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return session
}

/**
 * Require user to have specific role(s)
 */
export async function requireRole(roleNames: string | string[]) {
  const session = await requireAuth()
  const roles = Array.isArray(roleNames) ? roleNames : [roleNames]

  if (!hasAnyRole(session.user.roles, roles)) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Require user to have specific permission
 */
export async function requirePermission(action: string, subject: string) {
  const session = await requireAuth()

  if (!hasPermission(session.user.roles, action, subject)) {
    redirect('/unauthorized')
  }

  return session
}
