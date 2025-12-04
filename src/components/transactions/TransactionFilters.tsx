// src/components/transactions/TransactionFilters.tsx
'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import type { Category } from '@prisma/client'

type TransactionFiltersProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  categories: Category[]
  onResetFilters: () => void
  hasActiveFilters: boolean
}

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  onResetFilters,
  hasActiveFilters
}: TransactionFiltersProps) {
  const selectedCategory = categories.find(c => String(c.id) === categoryId)

  return (
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
      {/* Search Input */}
      <TextField
        size='small'
        label='Search'
        placeholder='Search description...'
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        sx={{ width: { xs: '100%', sm: 250 } }}
      />

      {/* Category Filter */}
      <FormControl size='small' sx={{ width: { xs: '100%', sm: 200 } }}>
        <InputLabel>Category</InputLabel>
        <Select label='Category' value={categoryId} onChange={e => onCategoryChange(e.target.value)}>
          <MenuItem value=''>
            <em>All Categories</em>
          </MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={String(cat.id)}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant='outlined' color='secondary' onClick={onResetFilters}>
          Reset Filters
        </Button>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {searchTerm && <Chip label={`Search: "${searchTerm}"`} size='small' onDelete={() => onSearchChange('')} />}
          {categoryId && selectedCategory && (
            <Chip label={`Category: ${selectedCategory.name}`} size='small' onDelete={() => onCategoryChange('')} />
          )}
        </Box>
      )}
    </Box>
  )
}
