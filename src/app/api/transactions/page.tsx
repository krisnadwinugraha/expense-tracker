// src/app/transactions/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { Prisma } from '@prisma/client'
import TransactionsView from '@/views/transactions'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function TransactionsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  console.log('Server Params Received:', searchParams)

  const query = typeof searchParams.query === 'string' ? searchParams.query : undefined
  const categoryId = typeof searchParams.categoryId === 'string' ? parseInt(searchParams.categoryId) : undefined

  const whereCondition: Prisma.TransactionWhereInput = {
    account: {
      userId: session.user.id
    },
    ...(query && {
      description: {
        contains: query,
        mode: 'insensitive'
      }
    }),
    ...(categoryId && {
      categoryId: categoryId
    })
  }

  const [transactions, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: whereCondition,
      include: {
        category: true,
        account: {
          include: { currency: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 50
    }),
    prisma.account.findMany({ where: { userId: session.user.id } }),
    prisma.category.findMany()
  ])

  return <TransactionsView initialData={{ transactions, accounts, categories }} />
}
