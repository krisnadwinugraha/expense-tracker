// src/components/transactions/TransactionForm.tsx
'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { Account, Category } from '@prisma/client'
import type { FullTransaction, TransactionFormData } from '@/hooks/use-transactions'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'

type TransactionFormProps = {
  transaction?: FullTransaction | null
  accounts: Account[]
  categories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
}

export default function TransactionForm({
  transaction,
  accounts,
  categories,
  onSuccess,
  onCancel
}: TransactionFormProps) {
  const { createTransaction, isLoading: isCreating } = useCreateTransaction()
  const { updateTransaction, isLoading: isUpdating } = useUpdateTransaction()

  const isLoading = isCreating || isUpdating
  const isEditing = !!transaction

  // Form state
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')

  // Initialize form when transaction changes
  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount))
      setDescription(transaction.description || '')
      setDate(new Date(transaction.date).toISOString().split('T')[0])
      setType(transaction.type)
      setAccountId(transaction.accountId)
      setCategoryId(String(transaction.categoryId))
    } else {
      // Reset to defaults for new transaction
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setType('expense')
      setAccountId(accounts[0]?.id || '')
      setCategoryId(String(categories[0]?.id || ''))
    }
    setError('')
  }, [transaction, accounts, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    const formData: TransactionFormData = {
      amount: amountNum,
      description: description || undefined,
      date,
      type,
      accountId,
      categoryId
    }

    let result
    if (isEditing) {
      result = await updateTransaction(transaction.id, formData)
    } else {
      result = await createTransaction(formData)
    }

    if (result.success) {
      onSuccess?.()
    } else if (result.error) {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5} className='pt-2'>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Amount'
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            disabled={isLoading}
            inputProps={{ step: '0.01', min: '0' }}
            error={!!error && error.includes('Amount')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              onChange={e => setType(e.target.value as 'expense' | 'income')}
              label='Type'
              required
              disabled={isLoading}
            >
              <MenuItem value='EXPENSE'>Expense</MenuItem>
              <MenuItem value='INCOME'>Income</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Account</InputLabel>
            <Select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              label='Account'
              required
              disabled={isLoading}
            >
              {accounts.map(acc => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              label='Category'
              required
              disabled={isLoading}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Date'
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            disabled={isLoading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Description (Optional)'
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color='error' variant='body2'>
              {error}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button onClick={onCancel} color='secondary' disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button variant='contained' type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}
