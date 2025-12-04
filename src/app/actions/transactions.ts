'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import { TransactionService } from '@/services/transaction.service'
import { transactionSchema } from '@/libs/validations/transaction'

export async function createTransaction(data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Unauthenticated' }

  const validationResult = transactionSchema.safeParse(data)

  if (!validationResult.success) {
    console.error('Validation Errors:', validationResult.error.flatten())
    return {
      error: 'Validation failed',
      errors: validationResult.error.flatten()
    }
  }

  try {
    const transaction = await TransactionService.createTransaction(session.user.id, {
      ...validationResult.data,
      date: new Date(validationResult.data.date)
    })

    revalidatePath('/transactions')
    return { success: true, data: transaction }
  } catch (error: any) {
    return { error: error.message }
  }
}
