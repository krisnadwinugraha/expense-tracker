// src/app/api/transactions/[transactionId]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route' // Adjust path

const prisma = new PrismaClient()

// PATCH: Update a specific transaction and adjust account balance
export async function PATCH(req: Request, { params }: { params: { transactionId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, description, date, type, accountId, categoryId } = body

    const originalTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        account: {
          userId: session.user.id // Security check
        }
      }
    })

    if (!originalTransaction) {
      return new NextResponse('Transaction not found or unauthorized', { status: 404 })
    }

    // --- Calculate the difference to apply to the account balance ---
    const originalAmountEffect =
      originalTransaction.type === TransactionType.EXPENSE ? -originalTransaction.amount : originalTransaction.amount

    const newAmountEffect = type === TransactionType.EXPENSE ? -amount : amount

    const balanceChange = newAmountEffect - originalAmountEffect

    // --- Use a Prisma Transaction for data integrity ---
    const [updatedTransaction, updatedAccount] = await prisma.$transaction([
      // 1. Update the transaction itself
      prisma.transaction.update({
        where: {
          id: params.transactionId
        },
        data: {
          amount,
          description,
          date: new Date(date),
          type,
          accountId,
          categoryId
        }
      }),
      // 2. Update the balance of the associated account
      prisma.account.update({
        where: {
          id: accountId
        },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      })
    ])

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('[TRANSACTION_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE: Delete a specific transaction and reverse the balance change
export async function DELETE(req: Request, { params }: { params: { transactionId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    // --- Find the transaction to delete to get its amount and type ---
    const transactionToDelete = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        account: {
          userId: session.user.id // Security check
        }
      }
    })

    if (!transactionToDelete) {
      return new NextResponse('Transaction not found or unauthorized', { status: 404 })
    }

    // --- Determine the amount to adjust the balance by ---
    const balanceAdjustment =
      transactionToDelete.type === TransactionType.EXPENSE
        ? transactionToDelete.amount // Deleting an expense adds money back
        : -transactionToDelete.amount // Deleting an income removes money

    // --- Use a Prisma Transaction for data integrity ---
    await prisma.$transaction([
      // 1. Delete the transaction
      prisma.transaction.delete({
        where: {
          id: params.transactionId
        }
      }),
      // 2. Update the account balance to reverse the transaction
      prisma.account.update({
        where: {
          id: transactionToDelete.accountId
        },
        data: {
          balance: {
            increment: balanceAdjustment
          }
        }
      })
    ])

    return new NextResponse(null, { status: 204 }) // Success, no content
  } catch (error) {
    console.error('[TRANSACTION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
