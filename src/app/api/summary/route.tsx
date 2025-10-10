// src/app/api/summary/route.ts
import { NextResponse } from 'next/server'

import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1) // First day of current month

    // Calculate total income and expenses for the current month
    const monthlySummary = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        account: {
          userId: session.user.id
        },
        date: {
          gte: startDate // gte = greater than or equal to
        }
      },
      _sum: {
        amount: true
      }
    })

    const totalIncome = monthlySummary.find(s => s.type === 'INCOME')?._sum.amount || 0
    const totalExpense = monthlySummary.find(s => s.type === 'EXPENSE')?._sum.amount || 0

    // Calculate total balance across all accounts
    const totalBalance = await prisma.account.aggregate({
      where: {
        userId: session.user.id
      },
      _sum: {
        balance: true
      }
    })

    const summary = {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      totalBalance: totalBalance._sum.balance || 0
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[SUMMARY_GET]', error)

    return new NextResponse('Internal Error', { status: 500 })
  }
}
