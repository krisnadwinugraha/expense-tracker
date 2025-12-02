// src/views/transactions/index.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

// ============================================================
// TYPE DEFINITIONS
// ============================================================
type FullTransaction = Transaction & {
  category: Category
  account: Account & { currency: Currency }
}

type TransactionData = {
  transactions: FullTransaction[]
  accounts: Account[]
  categories: Category[]
}

type PaginationData = {
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

type Props = {
  initialData: TransactionData
  pagination: PaginationData
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const TransactionsView = ({ initialData, pagination }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // ============================================================
  // 1. FILTER STATE (Synced with URL)
  // ============================================================
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')
  const [filterCategory, setFilterCategory] = useState(searchParams.get('categoryId') || '')

  // ============================================================
  // 2. DIALOG AND FORM STATE
  // ============================================================
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<FullTransaction | null>(null)

  // ============================================================
  // 3. FORM FIELD STATE
  // ============================================================
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('EXPENSE')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // ============================================================
  // 4. URL PARAMETER MANAGEMENT
  // ============================================================
  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    if ('query' in updates || 'categoryId' in updates) {
      params.set('page', '1')
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // ============================================================
  // 5. DEBOUNCED SEARCH
  // ============================================================
  useEffect(() => {
    const currentQuery = searchParams.get('query') || ''

    if (searchTerm === currentQuery) return

    const timeoutId = setTimeout(() => {
      updateURLParams({ query: searchTerm || null })
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // ============================================================
  // 6. DIALOG HANDLERS
  // ============================================================
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
    setError('')
  }

  // ============================================================
  // 7. FORM SUBMISSION
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
    const method = editingTransaction ? 'PATCH' : 'POST'

    try {
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
        handleClose()
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} transaction`)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('[TRANSACTION_SUBMIT_ERROR]', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================
  // 8. DELETE HANDLER
  // ============================================================
  const handleDelete = async (transactionId: string) => {
    if (!window.confirm('Delete this transaction? The account balance will be updated.')) {
      return
    }

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete transaction')
      }
    } catch (err) {
      console.error('[TRANSACTION_DELETE_ERROR]', err)
      alert('Failed to delete transaction')
    }
  }

  // ============================================================
  // 9. PAGINATION HANDLER
  // ============================================================
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    updateURLParams({ page: String(page) })
  }

  // ============================================================
  // 10. FILTER HANDLERS
  // ============================================================
  const handleCategoryChange = (value: string) => {
    setFilterCategory(value)
    updateURLParams({ categoryId: value || null })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterCategory('')
    startTransition(() => {
      router.replace(pathname)
    })
  }

  // ============================================================
  // 11. RENDER
  // ============================================================
  const hasActiveFilters = searchTerm || filterCategory
  const isLoading = isPending

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='h5'>Transactions</Typography>
                {isLoading && <CircularProgress size={20} />}
              </Box>
            }
            action={
              <Button variant='contained' onClick={handleOpenAdd} startIcon={<i className='ri-add-line' />}>
                Add Transaction
              </Button>
            }
          />

          {/* ============================================================
              FILTER BAR
          ============================================================ */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap'
            }}
          >
            <TextField
              size='small'
              label='Search'
              placeholder='Search description...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: 250 } }}
            />

            <FormControl size='small' sx={{ width: { xs: '100%', sm: 200 } }}>
              <InputLabel>Category</InputLabel>
              <Select label='Category' value={filterCategory} onChange={e => handleCategoryChange(e.target.value)}>
                <MenuItem value=''>
                  <em>All Categories</em>
                </MenuItem>
                {initialData.categories.map(cat => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button variant='outlined' color='secondary' onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {searchTerm && (
                  <Chip label={`Search: "${searchTerm}"`} size='small' onDelete={() => setSearchTerm('')} />
                )}
                {filterCategory && (
                  <Chip
                    label={`Category: ${
                      initialData.categories.find(c => String(c.id) === filterCategory)?.name || 'Unknown'
                    }`}
                    size='small'
                    onDelete={() => handleCategoryChange('')}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* ============================================================
              RESULTS COUNT
          ============================================================ */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
            <Typography variant='body2' color='text.secondary'>
              Showing {initialData.transactions.length} of {pagination.totalCount} transactions
              {hasActiveFilters && ' (filtered)'}
            </Typography>
          </Box>

          {/* ============================================================
              TABLE
          ============================================================ */}
          <TableContainer component={Paper} sx={{ opacity: isLoading ? 0.5 : 1 }}>
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
                {initialData.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                      <Typography variant='body1' color='text.secondary' gutterBottom>
                        {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                      </Typography>
                      {hasActiveFilters && (
                        <Button variant='text' onClick={handleResetFilters} sx={{ mt: 2 }}>
                          Clear Filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  initialData.transactions.map(tx => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{new Date(tx.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell>{tx.category.name}</TableCell>
                      <TableCell>{tx.account.name}</TableCell>
                      <TableCell align='right'>
                        <Typography fontWeight='medium' color={tx.type === 'expense' ? 'error.main' : 'success.main'}>
                          {tx.type === 'expense' ? '-' : '+'}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: tx.account.currency.code
                          }).format(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton onClick={() => handleOpenEdit(tx)} size='small' color='primary'>
                          <i className='ri-pencil-line' />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(tx.id)} size='small' color='error'>
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ============================================================
              PAGINATION
          ============================================================ */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color='primary'
                showFirstButton
                showLastButton
                disabled={isLoading}
              />
            </Box>
          )}
        </Card>
      </Grid>

      {/* ============================================================
          DIALOG FORM
      ============================================================ */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={5} className='pt-2'>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Amount'
                  type='number'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={type} onChange={e => setType(e.target.value)} label='Type' required>
                    <MenuItem value='EXPENSE'>Expense</MenuItem>
                    <MenuItem value='INCOME'>Income</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select value={accountId} onChange={e => setAccountId(e.target.value)} label='Account' required>
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
                  <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} label='Category' required>
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
                  required
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
                  <Typography color='error' variant='body2'>
                    {error}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button onClick={handleClose} color='secondary' disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default TransactionsView
