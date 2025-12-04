// src/app/actions/transactions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'
import { TransactionService } from '@/services/transaction.service'
import { transactionSchema } from '@/libs/validations/transaction'

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthenticated' }
  }

  const rawData = {
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    type: formData.get('type') as string,
    accountId: formData.get('accountId') as string,
    categoryId: formData.get('categoryId') as string
  }

  const validationResult = transactionSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: 'Validation failed',
      details: validationResult.error.flatten()
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
    console.error('[CREATE_TRANSACTION_ACTION]', error)
    return { error: error.message || 'Failed to create transaction' }
  }
}
