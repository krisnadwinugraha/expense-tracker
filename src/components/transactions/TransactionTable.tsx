// src/components/transactions/TransactionTable.tsx
'use client'

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

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
  }

  if (transactions.length === 0) {
    return (
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
            <TableRow>
              <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                <Typography variant='body1' color='text.secondary' gutterBottom>
                  {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                </Typography>
                {hasActiveFilters && onResetFilters && (
                  <Button variant='text' onClick={onResetFilters} sx={{ mt: 2 }}>
                    Clear Filters
                  </Button>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
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
          {transactions.map(tx => (
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
                <IconButton onClick={() => onEdit(tx)} size='small' color='primary' disabled={isDeleting}>
                  <i className='ri-pencil-line' />
                </IconButton>
                <IconButton onClick={() => handleDelete(tx.id)} size='small' color='error' disabled={isDeleting}>
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
