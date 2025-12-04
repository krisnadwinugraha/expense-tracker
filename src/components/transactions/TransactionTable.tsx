// src/components/transactions/TransactionTable.tsx
'use client'

import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'
import type { FullTransaction } from '@/hooks/use-transactions'
import { useDeleteTransaction } from '@/hooks/use-transactions'

type TransactionTableProps = {
  transactions: FullTransaction[]
  onEdit: (transaction: FullTransaction) => void
  isLoading?: boolean
  hasActiveFilters?: boolean
  onResetFilters?: () => void
}

export default function TransactionTable({
  transactions,
  onEdit,
  isLoading = false,
  hasActiveFilters = false,
  onResetFilters
}: TransactionTableProps) {
  const { deleteTransaction, isLoading: isDeleting } = useDeleteTransaction()
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteClick = (tx: FullTransaction) => {
    setDeleteConfirm({ id: tx.id, description: tx.description || 'this transaction' })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      setDeletingId(deleteConfirm.id)
      await deleteTransaction(deleteConfirm.id)
      setDeletingId(null)
      setDeleteConfirm(null)
    }
  }

  // Empty state when no transactions
  if (transactions.length === 0 && !isLoading) {
    return (
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
              <TableCell align='right' sx={{ fontWeight: 600 }}>
                Amount
              </TableCell>
              <TableCell align='right' sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} align='center' sx={{ py: 8, border: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i
                      className={hasActiveFilters ? 'ri-filter-off-line' : 'ri-receipt-line'}
                      style={{ fontSize: 32, opacity: 0.5 }}
                    />
                  </Box>
                  <Typography variant='h6' color='text.primary'>
                    {hasActiveFilters ? 'No transactions found' : 'No transactions yet'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more results'
                      : 'Get started by adding your first transaction'}
                  </Typography>
                  {hasActiveFilters && onResetFilters && (
                    <Button variant='outlined' onClick={onResetFilters} startIcon={<i className='ri-close-line' />}>
                      Clear Filters
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
              <TableCell align='right' sx={{ fontWeight: 600 }}>
                Amount
              </TableCell>
              <TableCell align='right' sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton width='80%' />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton width='60%' />
                    </TableCell>
                    <TableCell>
                      <Skeleton width='70%' />
                    </TableCell>
                    <TableCell align='right'>
                      <Skeleton width='80%' sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Skeleton variant='circular' width={32} height={32} />
                        <Skeleton variant='circular' width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              : // Actual transaction rows
                transactions.map(tx => (
                  <TableRow
                    key={tx.id}
                    hover
                    sx={{
                      opacity: deletingId === tx.id ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <TableCell>
                      <Typography variant='body2'>
                        {new Date(tx.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{tx.description || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={tx.category.name} size='small' variant='outlined' sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {tx.account.name}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography
                          variant='body2'
                          fontWeight='600'
                          color={tx.type === 'expense' ? 'error.main' : 'success.main'}
                        >
                          {tx.type === 'expense' ? '-' : '+'}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: tx.account.currency.code
                          }).format(tx.amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title='Edit transaction'>
                          <IconButton
                            onClick={() => onEdit(tx)}
                            size='small'
                            color='primary'
                            disabled={isDeleting || deletingId === tx.id}
                          >
                            <i className='ri-pencil-line' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete transaction'>
                          <IconButton
                            onClick={() => handleDeleteClick(tx)}
                            size='small'
                            color='error'
                            disabled={isDeleting || deletingId === tx.id}
                          >
                            {deletingId === tx.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <i className='ri-delete-bin-line' />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Delete Transaction?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteConfirm?.description}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
