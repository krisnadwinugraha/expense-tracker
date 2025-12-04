// src/hooks/use-transactions.ts
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Transaction, Category, Account, Currency } from '@prisma/client'

export type FullTransaction = Transaction & {
  category: Category
  account: Account & { currency: Currency }
}

export type TransactionFormData = {
  amount: number
  description?: string
  date: string
  type: 'expense' | 'income'
  accountId: string
  categoryId: string
}

export function useCreateTransaction() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const createTransaction = async (data: TransactionFormData) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data
        })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to create transaction' }))
        throw new Error(error.message)
      }

      const result = await res.json()

      toast.success('Transaction created successfully')
      router.refresh()

      return { success: true, data: result }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction')
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return { createTransaction, isLoading }
}

export function useUpdateTransaction() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateTransaction = async (id: string, data: TransactionFormData) => {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data
        })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to update transaction' }))
        throw new Error(error.message)
      }

      const result = await res.json()

      toast.success('Transaction updated successfully')
      router.refresh()

      return { success: true, data: result }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update transaction')
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return { updateTransaction, isLoading }
}

export function useDeleteTransaction() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const deleteTransaction = async (id: string) => {
    if (!window.confirm('Delete this transaction? The account balance will be updated.')) {
      return { success: false, cancelled: true }
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to delete transaction' }))
        throw new Error(error.message)
      }

      toast.success('Transaction deleted successfully')
      router.refresh()

      return { success: true }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction')
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return { deleteTransaction, isLoading }
}
