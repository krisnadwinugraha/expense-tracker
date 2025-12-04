// src/lib/validations/transaction.ts
import { z } from 'zod'
import { TransactionType } from '@prisma/client'

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional().nullable(),
  date: z.string().datetime().or(z.date()),
  type: z.nativeEnum(TransactionType),
  accountId: z.string().cuid('Invalid account ID'),
  categoryId: z.string().cuid('Invalid category ID')
})

export const transactionQuerySchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionQuery = z.infer<typeof transactionQuerySchema>
