// src/app/transactions/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { Prisma } from '@prisma/client'
import TransactionsView from '@/views/transactions'

// 1. Force dynamic rendering so search params always work
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

  // FIX: Do not use parseInt for String/CUID IDs
  const categoryId = typeof searchParams.categoryId === 'string' ? searchParams.categoryId : undefined

  // Pagination Logic
  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const pageSize = 5
  const skip = (page - 1) * pageSize

  // ============================================================
  // 2. BUILD DYNAMIC WHERE CONDITION
  // ============================================================
  const whereCondition: Prisma.TransactionWhereInput = {
    account: {
      userId: session.user.id
    },
    // Search by description (if query exists)
    ...(query && {
      description: {
        contains: query,
        mode: 'insensitive'
      }
    }),
    // Filter by Category (if selected)
    ...(categoryId && {
      categoryId: categoryId
    })
  }

  // ============================================================
  // 3. FETCH DATA
  // ============================================================
  try {
    const [transactions, totalCount, accounts, categories] = await Promise.all([
      // A. Get Paginated Transactions
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

      // B. Get Total Count (for pagination UI)
      prisma.transaction.count({
        where: whereCondition
      }),

      // C. Get Filters Data
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
    return (
      <div className='p-5 text-center'>
        <h2 className='text-xl font-bold text-red-500'>Failed to load transactions</h2>
        <p>Please try refreshing the page.</p>
      </div>
    )
  }
}
