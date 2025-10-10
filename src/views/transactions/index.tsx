// src/views/transactions/index.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Account, Category, Currency, Transaction } from '@prisma/client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

// Define the full type for a transaction with all its relations
type FullTransaction = Transaction & { category: Category; account: Account & { currency: Currency } }

type TransactionData = {
  transactions: FullTransaction[]
  accounts: Account[]
  categories: Category[]
}

const TransactionsView = ({ initialData }: { initialData: TransactionData }) => {
  const router = useRouter()

  // --- Dialog and Form State ---
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<FullTransaction | null>(null)

  // --- Form Field State ---
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('EXPENSE')
  const [accountId, setAccountId] = useState(initialData.accounts[0]?.id || '')
  const [categoryId, setCategoryId] = useState(String(initialData.categories[0]?.id || ''))

  // --- Dialog Handlers ---
  const handleOpenAdd = () => {
    setEditingTransaction(null)
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setType('EXPENSE')
    setAccountId(initialData.accounts[0]?.id || '')
    setCategoryId(String(initialData.categories[0]?.id || ''))
    setError('')
    setOpen(true)
  }

  const handleOpenEdit = (transaction: FullTransaction) => {
    setEditingTransaction(transaction)
    setAmount(String(transaction.amount))
    setDescription(transaction.description || '')
    setDate(new Date(transaction.date).toISOString().split('T')[0])
    setType(transaction.type)
    setAccountId(transaction.accountId)
    setCategoryId(String(transaction.categoryId))
    setError('')
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // --- Form Submission (Create & Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'

    const method = editingTransaction ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        date,
        type,
        accountId,
        categoryId: parseInt(categoryId)
      })
    })

    if (res.ok) {
      router.refresh() // Re-fetches server data and updates the UI
      handleClose()
    } else {
      const data = await res.json()
      setError(data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} transaction.`)
    }
    setIsSubmitting(false)
  }

  // --- Delete Handler ---
  const handleDelete = async (transactionId: string) => {
    if (
      !window.confirm('Are you sure you want to delete this transaction? This will also update the account balance.')
    ) {
      return
    }

    const res = await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete transaction.')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Transactions'
            action={
              <Button variant='contained' onClick={handleOpenAdd} startIcon={<i className='ri-add-line' />}>
                Add Transaction
              </Button>
            }
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialData.transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.description || '-'}</TableCell>
                    <TableCell>{tx.category.name}</TableCell>
                    <TableCell>{tx.account.name}</TableCell>
                    <TableCell align='right'>
                      <Typography color={tx.type === 'EXPENSE' ? 'error' : 'success.main'}>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: tx.account.currency.code
                        }).format(tx.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => handleOpenEdit(tx)}>
                        <i className='ri-pencil-line' />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(tx.id)}>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* The Dialog (Modal) for Adding/Editing */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={4} className='pt-4'>
              {/* Form Fields... */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Amount'
                  type='number'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={type} onChange={e => setType(e.target.value)} label='Type'>
                    <MenuItem value='EXPENSE'>Expense</MenuItem>
                    <MenuItem value='INCOME'>Income</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select value={accountId} onChange={e => setAccountId(e.target.value)} label='Account'>
                    {initialData.accounts.map(acc => (
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
                  <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} label='Category'>
                    {initialData.categories.map(cat => (
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Description (Optional)'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Typography color='error'>{error}</Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default TransactionsView
