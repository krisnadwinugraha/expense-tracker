import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client' // Ensure TransactionType is imported
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'

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

    // 1. Validation ----------------------------------------
    if (!amount || !date || !type || !accountId || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Ensure amount is actually a number (req.json parsers might verify, but safe to cast)
    const amountFloat = parseFloat(amount)
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Validate transaction type against the Prisma Enum
    // This assumes your Enum is named 'TransactionType' in schema.prisma
    if (!Object.values(TransactionType).includes(type as TransactionType)) {
      return NextResponse.json({ message: 'Invalid transaction type' }, { status: 400 })
    }

    // 2. Ownership Verification ----------------------------
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json({ message: 'Account not found or unauthorized' }, { status: 404 })
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    // 3. Database Action -----------------------------------
    // We cast `type` to the Enum to satisfy TypeScript
    const typeEnum = type as TransactionType

    const [newTransaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: amountFloat,
          description: description || null,
          date: new Date(date),
          type: typeEnum,
          accountId,
          categoryId,
          userId: session.user.id
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
            // Use the strictly typed Enum for comparison
            [typeEnum === TransactionType.expense ? 'decrement' : 'increment']: amountFloat
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
