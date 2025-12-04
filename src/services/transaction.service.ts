// src/services/transaction.service.ts
import prisma from '@/libs/prisma'
import { TransactionType, Prisma } from '@prisma/client'

export class TransactionService {
  /**
   * Create transaction with automatic balance update
   */
  static async createTransaction(
    userId: string,
    data: {
      amount: number
      description?: string | null
      date: Date
      type: TransactionType
      accountId: string
      categoryId: string
    }
  ) {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId }
    })

    if (!account) {
      throw new Error('Account not found or unauthorized')
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      throw new Error('Category not found')
    }

    // Create transaction and update balance atomically
    const balanceChange = data.type === TransactionType.expense ? -data.amount : data.amount

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          ...data,
          userId
        },
        include: {
          category: true,
          account: { include: { currency: true } }
        }
      }),
      prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceChange } }
      })
    ])

    return transaction
  }

  /**
   * Update transaction with balance reconciliation
   */
  static async updateTransaction(
    userId: string,
    transactionId: string,
    data: {
      amount: number
      description?: string | null
      date: Date
      type: TransactionType
      accountId: string
      categoryId: string
    }
  ) {
    // Find original transaction
    const original = await prisma.transaction.findFirst({
      where: { id: transactionId, account: { userId } }
    })

    if (!original) {
      throw new Error('Transaction not found or unauthorized')
    }

    // Verify new account if changed
    if (data.accountId !== original.accountId) {
      const newAccount = await prisma.account.findFirst({
        where: { id: data.accountId, userId }
      })
      if (!newAccount) {
        throw new Error('New account not found or unauthorized')
      }
    }

    // Calculate balance adjustments
    const originalEffect = original.type === TransactionType.expense ? -original.amount : original.amount

    const newEffect = data.type === TransactionType.expense ? -data.amount : data.amount

    // Build transaction operations
    const operations: any[] = [
      prisma.transaction.update({
        where: { id: transactionId },
        data: {
          amount: data.amount,
          description: data.description,
          date: data.date,
          type: data.type,
          accountId: data.accountId,
          categoryId: data.categoryId
        },
        include: {
          category: true,
          account: { include: { currency: true } }
        }
      })
    ]

    if (data.accountId === original.accountId) {
      // Same account: net balance change
      operations.push(
        prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newEffect - originalEffect } }
        })
      )
    } else {
      // Different accounts: reverse old, apply new
      operations.push(
        prisma.account.update({
          where: { id: original.accountId },
          data: { balance: { increment: -originalEffect } }
        }),
        prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newEffect } }
        })
      )
    }

    const [updatedTransaction] = await prisma.$transaction(operations)
    return updatedTransaction
  }

  /**
   * Delete transaction with balance rollback
   */
  static async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, account: { userId } }
    })

    if (!transaction) {
      throw new Error('Transaction not found or unauthorized')
    }

    const balanceAdjustment = transaction.type === TransactionType.expense ? transaction.amount : -transaction.amount

    await prisma.$transaction([
      prisma.transaction.delete({ where: { id: transactionId } }),
      prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceAdjustment } }
      })
    ])
  }

  /**
   * Get paginated transactions with filters
   */
  static async getTransactions(
    userId: string,
    filters: {
      query?: string
      categoryId?: string
      accountId?: string
      page?: number
      pageSize?: number
    }
  ) {
    const { query, categoryId, accountId, page = 1, pageSize = 10 } = filters
    const skip = (page - 1) * pageSize

    const where: Prisma.TransactionWhereInput = {
      account: { userId },
      ...(query && {
        description: { contains: query, mode: 'insensitive' }
      }),
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId })
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: { include: { currency: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.transaction.count({ where })
    ])

    return {
      transactions,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount
      }
    }
  }
}
