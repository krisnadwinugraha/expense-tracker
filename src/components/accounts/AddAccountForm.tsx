// src/components/accounts/AddAccountForm.tsx
'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import type { Currency } from '@prisma/client'

export const AddAccountForm = () => {
  const [name, setName] = useState('')
  const [currencyId, setCurrencyId] = useState('')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  // Fetch currencies when the component mounts
  useEffect(() => {
    const fetchCurrencies = async () => {
      const res = await fetch('/api/currencies')
      const data = await res.json()

      setCurrencies(data)

      if (data.length > 0) {
        setCurrencyId(String(data[0].id)) // Set a default
      }
    }

    fetchCurrencies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, currencyId: Number(currencyId) })
    })

    if (res.ok) {
      setName('') // Reset form
      router.refresh() // Refresh the page to show the new account in the list
    } else {
      const data = await res.json()

      setError(data.message || 'Failed to create account.')
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Account</h3>
      <input
        type='text'
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder='Account Name (e.g., Cash Wallet)'
        required
        className='text-black'
      />
      <select value={currencyId} onChange={e => setCurrencyId(e.target.value)} required className='text-black'>
        {currencies.map(currency => (
          <option key={currency.id} value={currency.id}>
            {currency.name} ({currency.code})
          </option>
        ))}
      </select>
      <button type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Account'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
