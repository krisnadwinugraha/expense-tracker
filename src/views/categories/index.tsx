// src/views/categories/index.tsx
'use client'

import { useState, useEffect } from 'react'
import type { Category } from '@prisma/client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
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

const CategoriesView = () => {
  // Data State
  const [categories, setCategories] = useState<Category[]>([])

  // Dialog (Modal) State
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // State to determine if we are editing or creating
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Form Field State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // --- Data Fetching ---
  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    if (res.ok) {
      const data = await res.json()
      setCategories(data)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // --- Dialog Handlers ---
  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setError('')
    setOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description || '')
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

    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'

    const method = editingCategory ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })

    if (res.ok) {
      await fetchCategories()
      handleClose()
    } else {
      const data = await res.json()
      setError(data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} category.`)
    }
    setIsSubmitting(false)
  }

  // --- Delete Handler ---
  const handleDelete = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    const res = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      await fetchCategories()
    } else {
      alert('Failed to delete category.')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Transaction Categories'
            subheader='Manage your custom categories for income and expenses.'
            // The "Add New" button is in the header
            action={
              <Button variant='contained' onClick={handleOpenAdd} startIcon={<i className='ri-add-line' />}>
                Add Category
              </Button>
            }
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell component='th' scope='row'>
                      {category.name}
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => handleOpenEdit(category)}>
                        <i className='ri-pencil-line' />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(category.id)}>
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
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={4} className='pt-4'>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Category Name'
                  placeholder='e.g., Food, Salary, Transport'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  placeholder='(Optional) A short description'
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
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  )
}

export default CategoriesView
