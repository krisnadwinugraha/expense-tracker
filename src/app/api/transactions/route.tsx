// src/app/api/transactions/route.ts

import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: Fetch all transactions for the logged-in user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const skip = (page - 1) * pageSize

    const whereCondition = {
      account: {
        userId: session.user.id
      }
    }

    const [transactions, totalItems] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: whereCondition,
        include: {
          category: true,
          account: {
            include: {
              currency: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip: skip,
        take: pageSize
      }),
      prisma.transaction.count({
        where: whereCondition
      })
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      data: transactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      }
    })
  } catch (error) {
    console.error('[TRANSACTIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST: Create a new transaction and update account balance
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, description, date, type, accountId, categoryId } = body

    if (!amount || !date || !type || !accountId || !categoryId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const accountToUpdate = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    })

    if (!accountToUpdate) {
      return new NextResponse('Account not found or unauthorized', { status: 404 })
    }

    const [newTransaction, updatedAccount] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount,
          description,
          date: new Date(date),
          type,
          accountId,
          categoryId
        }
      }),
      prisma.account.update({
        where: {
          id: accountId
        },
        data: {
          balance: {
            // If it's an EXPENSE, decrement. If INCOME, increment.
            [type === TransactionType.EXPENSE ? 'decrement' : 'increment']: amount
          }
        }
      })
    ])

    return NextResponse.json(newTransaction)
  } catch (error) {
    console.error('[TRANSACTIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
