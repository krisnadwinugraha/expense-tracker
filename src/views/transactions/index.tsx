// src/views/transactions/index.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Account, Category } from '@prisma/client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionDialog from '@/components/transactions/TransactionDialog'
import type { FullTransaction } from '@/hooks/use-transactions'

// ============================================================
// TYPE DEFINITIONS
// ============================================================
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
  // STATE
  // ============================================================
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')
  const [filterCategory, setFilterCategory] = useState(searchParams.get('categoryId') || '')
  const [open, setOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FullTransaction | null>(null)

  // ============================================================
  // URL PARAMETER MANAGEMENT
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
  // DEBOUNCED SEARCH
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
  // HANDLERS
  // ============================================================
  const handleOpenAdd = () => {
    setEditingTransaction(null)
    setOpen(true)
  }

  const handleOpenEdit = (transaction: FullTransaction) => {
    setEditingTransaction(transaction)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingTransaction(null)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    updateURLParams({ page: String(page) })
  }

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
  // COMPUTED VALUES
  // ============================================================
  const hasActiveFilters = Boolean(searchTerm || filterCategory)
  const isLoading = isPending

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          {/* HEADER */}
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

          {/* FILTERS */}
          <TransactionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryId={filterCategory}
            onCategoryChange={handleCategoryChange}
            categories={initialData.categories}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* RESULTS COUNT */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
            <Typography variant='body2' color='text.secondary'>
              Showing {initialData.transactions.length} of {pagination.totalCount} transactions
              {hasActiveFilters && ' (filtered)'}
            </Typography>
          </Box>

          {/* TABLE */}
          <TransactionTable
            transactions={initialData.transactions}
            onEdit={handleOpenEdit}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          {/* PAGINATION */}
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

      {/* DIALOG */}
      <TransactionDialog
        open={open}
        onClose={handleClose}
        transaction={editingTransaction}
        accounts={initialData.accounts}
        categories={initialData.categories}
      />
    </Grid>
  )
}

export default TransactionsView
