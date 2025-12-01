// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

// ============================================================
// POST: Create a new transaction and update account balance
// ============================================================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, description, date, type, accountId, categoryId } = body

    // Validate required fields
    if (!amount || !date || !type || !accountId || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Validate transaction type
    if (!['EXPENSE', 'INCOME'].includes(type)) {
      return NextResponse.json({ message: 'Invalid transaction type' }, { status: 400 })
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json({ message: 'Account not found or unauthorized' }, { status: 404 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    // Atomic Transaction: Create Record + Update Balance
    const [newTransaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount,
          description: description || null,
          date: new Date(date),
          type,
          accountId,
          categoryId
        },
        include: {
          category: true,
          account: {
            include: { currency: true }
          }
        }
      }),
      prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            [type === TransactionType.EXPENSE ? 'decrement' : 'increment']: amount
          }
        }
      })
    ])

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error('[TRANSACTIONS_POST]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
