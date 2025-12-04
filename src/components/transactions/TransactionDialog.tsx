// src/components/transactions/TransactionDialog.tsx
'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import type { Account, Category } from '@prisma/client'
import type { FullTransaction } from '@/hooks/use-transactions'
import TransactionForm from './TransactionForm'

type TransactionDialogProps = {
  open: boolean
  onClose: () => void
  transaction?: FullTransaction | null
  accounts: Account[]
  categories: Category[]
}

export default function TransactionDialog({
  open,
  onClose,
  transaction,
  accounts,
  categories
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
      <DialogContent>
        <TransactionForm
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
