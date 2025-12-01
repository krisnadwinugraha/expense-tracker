// src/app/api/transactions/[transactionId]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

// ============================================================
// PATCH: Update a specific transaction and adjust account balance
// ============================================================
export async function PATCH(req: Request, { params }: { params: { transactionId: string } }) {
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

    // Find original transaction with security check
    const originalTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        account: {
          userId: session.user.id
        }
      }
    })

    if (!originalTransaction) {
      return NextResponse.json({ message: 'Transaction not found or unauthorized' }, { status: 404 })
    }

    // Verify new account belongs to user (if account is being changed)
    if (accountId !== originalTransaction.accountId) {
      const newAccount = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId: session.user.id
        }
      })

      if (!newAccount) {
        return NextResponse.json({ message: 'New account not found or unauthorized' }, { status: 404 })
      }
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    // ============================================================
    // Calculate balance changes
    // ============================================================

    // 1. Calculate effect of original transaction
    const originalEffect =
      originalTransaction.type === TransactionType.EXPENSE ? -originalTransaction.amount : originalTransaction.amount

    // 2. Calculate effect of new transaction
    const newEffect = type === TransactionType.EXPENSE ? -amount : amount

    // 3. Net change for the account
    const balanceChange = newEffect - originalEffect

    // ============================================================
    // Handle account changes (if moving transaction to different account)
    // ============================================================
    const transactionUpdates = []

    if (accountId === originalTransaction.accountId) {
      // Same account: Single balance update
      transactionUpdates.push(
        prisma.transaction.update({
          where: { id: params.transactionId },
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
            account: { include: { currency: true } }
          }
        }),
        prisma.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: balanceChange }
          }
        })
      )
    } else {
      // Different account: Reverse original and apply new
      transactionUpdates.push(
        prisma.transaction.update({
          where: { id: params.transactionId },
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
            account: { include: { currency: true } }
          }
        }),
        // Reverse the original transaction from old account
        prisma.account.update({
          where: { id: originalTransaction.accountId },
          data: {
            balance: { increment: -originalEffect }
          }
        }),
        // Apply new transaction to new account
        prisma.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: newEffect }
          }
        })
      )
    }

    // Execute atomic transaction
    const [updatedTransaction] = await prisma.$transaction(transactionUpdates)

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('[TRANSACTION_PATCH]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// DELETE: Delete a specific transaction and reverse the balance change
// ============================================================
export async function DELETE(req: Request, { params }: { params: { transactionId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    // Find the transaction to delete with security check
    const transactionToDelete = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        account: {
          userId: session.user.id
        }
      }
    })

    if (!transactionToDelete) {
      return NextResponse.json({ message: 'Transaction not found or unauthorized' }, { status: 404 })
    }

    // Calculate balance adjustment (reverse the transaction)
    const balanceAdjustment =
      transactionToDelete.type === TransactionType.EXPENSE
        ? transactionToDelete.amount // Deleting expense adds money back
        : -transactionToDelete.amount // Deleting income removes money

    // Atomic transaction: Delete record + Update balance
    await prisma.$transaction([
      prisma.transaction.delete({
        where: { id: params.transactionId }
      }),
      prisma.account.update({
        where: { id: transactionToDelete.accountId },
        data: {
          balance: { increment: balanceAdjustment }
        }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[TRANSACTION_DELETE]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
