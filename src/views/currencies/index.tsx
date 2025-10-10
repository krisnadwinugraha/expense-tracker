'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import type { Currency } from '@prisma/client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'

// ... (include all other necessary MUI imports like TableBody, TableCell, etc.)
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

const CurrenciesView = ({ initialData }: { initialData: Currency[] }) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)

  // Form Fields
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleOpenAdd = () => {
    setEditingCurrency(null)
    setCode('')
    setName('')
    setDescription('')
    setError('')
    setOpen(true)
  }

  const handleOpenEdit = (currency: Currency) => {
    setEditingCurrency(currency)
    setCode(currency.code)
    setName(currency.name)
    setDescription(currency.description || '')
    setError('')
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const url = editingCurrency ? `/api/currencies/${editingCurrency.id}` : '/api/currencies'
    const method = editingCurrency ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, description })
    })

    if (res.ok) {
      router.refresh()
      handleClose()
    } else {
      const data = await res.json()

      setError(data.message || 'Failed to save currency.')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (currencyId: number) => {
    if (!window.confirm('Are you sure you want to delete this currency? This will fail if any account is using it.'))
      return

    const res = await fetch(`/api/currencies/${currencyId}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()

      alert(`Failed to delete currency: ${data.message || 'Unknown error'}`)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Currencies'
            subheader='Manage global currencies for your accounts.'
            action={
              <Button variant='contained' onClick={handleOpenAdd} startIcon={<i className='ri-add-line' />}>
                Add Currency
              </Button>
            }
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialData.map(currency => (
                  <TableRow key={currency.id}>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.description}</TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => handleOpenEdit(currency)}>
                        <i className='ri-pencil-line' />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(currency.id)}>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editingCurrency ? 'Edit Currency' : 'Add New Currency'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={4} className='pt-4'>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Code'
                  placeholder='e.g., IDR'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Name'
                  placeholder='e.g., Indonesian Rupiah'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  placeholder='(Optional)'
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default CurrenciesView
