// src/app/(main)/accounts/page.tsx
import { getServerSession } from 'next-auth/next'

import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AccountsView from '@views/accounts'

const prisma = new PrismaClient()

async function getAccountData(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: { currency: true },
    orderBy: { name: 'asc' }
  })

  const currencies = await prisma.currency.findMany({ orderBy: { name: 'asc' } })

  return { accounts, currencies }
}

const AccountsPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <p>Please log in.</p>
  }

  const accountData = await getAccountData(session.user.id)

  return <AccountsView initialData={accountData} />
}

export default AccountsPage
