// src/views/account-settings/account/index.tsx
'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type UserProfile = {
  name: string | null
  email: string | null
  username: string | null
}

const AccountTab = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch user profile on component load
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile')

      if (res.ok) {
        const data = await res.json()

        setProfile(data)
        setName(data.name || '')
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    if (password && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setIsSubmitting(false)
      
return
    }

    const dataToUpdate: { name: string; password?: string } = { name }

    if (password) {
      dataToUpdate.password = password
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToUpdate)
    })

    if (res.ok) {
      setMessage('Profile updated successfully!')
      setPassword('')
      setConfirmPassword('')
    } else {
      setMessage('Failed to update profile.')
    }

    setIsSubmitting(false)
  }

  if (!profile) {
    return <p>Loading profile...</p>
  }

  return (
    <Card>
      <CardHeader title='Profile Details' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Name' value={name} onChange={e => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label='Email' value={profile.email || ''} disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='password'
                label='New Password'
                placeholder='Leave blank to keep current'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='password'
                label='Confirm New Password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4 items-center'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              {message && (
                <Typography color={message.includes('successfully') ? 'success.main' : 'error'}>{message}</Typography>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountTab
