// src/app/transactions/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { Prisma } from '@prisma/client'
import TransactionsView from '@/views/transactions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  // ============================================================
  // 1. PARSE AND VALIDATE QUERY PARAMETERS
  // ============================================================
  const query = typeof searchParams.query === 'string' ? searchParams.query.trim() : ''
  const categoryIdParam = typeof searchParams.categoryId === 'string' ? searchParams.categoryId : ''
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined

  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const pageSize = 20 // Configurable page size

  const skip = (page - 1) * pageSize

  // ============================================================
  // 2. BUILD DYNAMIC WHERE CONDITION
  // ============================================================
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
    ...(categoryId &&
      !isNaN(categoryId) && {
        categoryId: categoryId
      })
  }

  // ============================================================
  // 3. FETCH DATA WITH ERROR HANDLING
  // ============================================================
  try {
    const [transactions, totalCount, accounts, categories] = await Promise.all([
      prisma.transaction.findMany({
        where: whereCondition,
        include: {
          category: true,
          account: {
            include: { currency: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.transaction.count({
        where: whereCondition
      }),
      prisma.account.findMany({
        where: { userId: session.user.id },
        orderBy: { name: 'asc' }
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
      <TransactionsView
        initialData={{
          transactions,
          accounts,
          categories
        }}
        pagination={{
          currentPage: page,
          pageSize,
          totalPages,
          totalCount
        }}
      />
    )
  } catch (error) {
    console.error('[TRANSACTIONS_PAGE_ERROR]', error)

    // You can create a proper error page component here
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Failed to load transactions</h2>
        <p>Please try refreshing the page</p>
      </div>
    )
  }
}
