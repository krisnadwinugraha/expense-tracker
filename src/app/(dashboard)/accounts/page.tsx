// src/app/(main)/accounts/page.tsx
import { PrismaClient } from '@prisma/client'
import { requireAuth, requirePermission, hasPermission } from '@/libs/authUtils'
import AccountsView from '@views/accounts'

const prisma = new PrismaClient()

async function getAccountData(userId: string, canViewAll: boolean) {
  // If user has permission to view all accounts, return all
  // Otherwise, return only their own accounts
  const accounts = await prisma.account.findMany({
    where: canViewAll ? {} : { userId },
    include: {
      currency: true,
      user: canViewAll ? true : false // Include user info if viewing all
    },
    orderBy: { name: 'asc' }
  })

  const currencies = await prisma.currency.findMany({
    orderBy: { name: 'asc' }
  })

  return { accounts, currencies }
}

const AccountsPage = async () => {
  // Require authentication
  const session = await requireAuth()

  // Check if user has permission to view all accounts
  const canViewAll = hasPermission(session.user.roles, 'read', 'all-accounts')

  const accountData = await getAccountData(session.user.id, canViewAll)

  return <AccountsView initialData={accountData} userRole={session.user.roles} />
}

export default AccountsPage
