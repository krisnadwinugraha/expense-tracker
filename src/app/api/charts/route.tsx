// src/app/api/charts/route.ts
import { NextResponse } from 'next/server'

import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  try {
    const today = new Date()

    // --- Chart 1: Monthly Expenses for the Current Year ---
    if (type === 'monthly_this_year') {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      const yearEnd = new Date(today.getFullYear(), 11, 31)

      const monthlyExpenses = await prisma.transaction.groupBy({
        by: ['date'],
        where: {
          account: { userId: session.user.id },
          type: TransactionType.EXPENSE,
          date: { gte: yearStart, lte: yearEnd }
        },
        _sum: { amount: true }
      })

      // Process data into a monthly format
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyTotals = Array(12).fill(0)

      monthlyExpenses.forEach(item => {
        const month = new Date(item.date).getMonth()

        if (item._sum.amount) {
          monthlyTotals[month] += item._sum.amount
        }
      })

      return NextResponse.json({ labels: monthNames, series: monthlyTotals })
    }

    // --- Chart 2: Daily Expenses for the Current Month ---
    if (type === 'daily_this_month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const dailyExpenses = await prisma.transaction.findMany({
        where: {
          account: { userId: session.user.id },
          type: TransactionType.EXPENSE,
          date: { gte: monthStart, lte: monthEnd }
        },
        select: { date: true, amount: true }
      })

      // Process data into a daily format
      const daysInMonth = monthEnd.getDate()

      const dailyTotals = Array(daysInMonth)
        .fill(0)
        .map((_, i) => ({ day: i + 1, total: 0 }))

      dailyExpenses.forEach(item => {
        const day = new Date(item.date).getDate()

        dailyTotals[day - 1].total += item.amount
      })

      return NextResponse.json({
        labels: dailyTotals.map(d => d.day),
        series: dailyTotals.map(d => d.total)
      })
    }

    return new NextResponse('Invalid chart type', { status: 400 })
  } catch (error) {
    console.error('[CHARTS_GET]', error)
    
return new NextResponse('Internal Error', { status: 500 })
  }
}
