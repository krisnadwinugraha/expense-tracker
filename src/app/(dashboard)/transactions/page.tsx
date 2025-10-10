// src/app/(main)/transactions/page.tsx
import { getServerSession } from 'next-auth/next'

import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/libs/auth'
import TransactionsView from '@views/transactions'

const prisma = new PrismaClient()

// Server-side function to get all necessary data
async function getTransactionData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { account: { userId } },
    include: { category: true, account: { include: { currency: true } } },
    orderBy: { date: 'desc' }
  })

  const accounts = await prisma.account.findMany({ where: { userId } })
  const categories = await prisma.category.findMany({ where: { userId } })

  return { transactions, accounts, categories }
}

const TransactionsPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <p>Please log in.</p>
  }

  // Fetch the data on the server
  const transactionData = await getTransactionData(session.user.id)

  // Pass the data as a prop to your new transactions view
  return <TransactionsView initialData={transactionData} />
}

export default TransactionsPage
