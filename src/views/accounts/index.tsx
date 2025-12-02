'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import type { Currency, Account, Role } from '@prisma/client'

// MUI Imports
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
import Grid from '@mui/material/Grid'

type AccountWithCurrency = Account & {
  currency: Currency
}

type AccountData = {
  accounts: AccountWithCurrency[]
  currencies: Currency[]
}

// 2. Define the Props interface including userRole
type Props = {
  initialData: AccountData
  userRole: Role[]
}

// 3. Destructure userRole from props
const AccountsView = ({ initialData, userRole }: Props) => {
  const router = useRouter()

  // Dialog (Modal) and Form State
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingAccount, setEditingAccount] = useState<AccountWithCurrency | null>(null)

  // Form Field State
  const [name, setName] = useState('')
  const [currencyId, setCurrencyId] = useState<string | number>(initialData.currencies[0]?.id || '')

  // --- Dialog Handlers ---
  const handleOpenAdd = () => {
    setEditingAccount(null)
    setName('')
    setCurrencyId(initialData.currencies[0]?.id || '')
    setError('')
    setOpen(true)
  }

  const handleOpenEdit = (account: AccountWithCurrency) => {
    setEditingAccount(account)
    setName(account.name)
    setCurrencyId(account.currencyId)
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

    const url = editingAccount ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
    const method = editingAccount ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, currencyId: Number(currencyId) })
    })

    if (res.ok) {
      router.refresh()
      handleClose()
    } else {
      const data = await res.json()
      setError(data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} account.`)
    }

    setIsSubmitting(false)
  }

  // --- Delete Handler ---
  const handleDelete = async (accountId: string) => {
    if (
      !window.confirm('Are you sure you want to delete this account? All associated transactions will also be deleted.')
    ) {
      return
    }

    const res = await fetch(`/api/accounts/${accountId}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete account.')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Financial Accounts'
            subheader='Manage your wallets, bank accounts, and other sources of funds.'
            action={
              <Button variant='contained' onClick={handleOpenAdd} startIcon={<i className='ri-add-line' />}>
                Add Account
              </Button>
            }
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell align='right'>Balance</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialData.accounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.currency.code}</TableCell>
                    <TableCell align='right'>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: account.currency.code }).format(
                        account.balance
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => handleOpenEdit(account)}>
                        <i className='ri-pencil-line' />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(account.id)}>
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={4} className='pt-4'>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Account Name'
                  placeholder='e.g., Cash Wallet, BCA Bank'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='currency-select-label'>Currency</InputLabel>
                  <Select
                    labelId='currency-select-label'
                    value={currencyId}
                    onChange={e => setCurrencyId(e.target.value)}
                    label='Currency'
                    required
                  >
                    {initialData.currencies.map(currency => (
                      <MenuItem key={currency.id} value={currency.id}>
                        {currency.name} ({currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default AccountsView
