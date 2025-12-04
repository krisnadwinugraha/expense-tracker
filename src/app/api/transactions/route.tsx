import { NextResponse } from 'next/server'
import { PrismaClient, TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import prisma from '@/libs/prisma'
import { TransactionService } from '@/services/transaction.service'
import { transactionSchema } from '@/libs/validations/transaction'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const validationResult = transactionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const transaction = await TransactionService.createTransaction(session.user.id, {
      ...validationResult.data,
      date: new Date(validationResult.data.date)
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('[TRANSACTIONS_POST]', error)

    // Handle known errors
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
