'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// NextAuth Imports
import { signIn } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

import themeConfig from '@configs/themeConfig'

type DemoAccount = {
  role: string
  email: string
  password: string
  color: 'primary' | 'secondary' | 'success'
  description: string
}

const demoAccounts: DemoAccount[] = [
  {
    role: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    color: 'primary',
    description: 'Full access to all features'
  },
  {
    role: 'Manager',
    email: 'manager@example.com',
    password: 'manager123',
    color: 'secondary',
    description: 'Can view all accounts'
  },
  {
    role: 'User',
    email: 'user@example.com',
    password: 'user123',
    color: 'success',
    description: 'Basic account access'
  }
]

const Login = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const router = useRouter()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setIsSubmitting(true)
    setError('')

    const result = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setIsSubmitting(false)
    } else if (result?.ok) {
      window.location.replace('/')
    }
  }

  const handleDemoLogin = async (account: DemoAccount) => {
    setDemoLoading(account.role)
    setError('')

    const result = await signIn('credentials', {
      redirect: false,
      email: account.email,
      password: account.password
    })

    if (result?.error) {
      setError('Demo login failed. Please try again.')
      setDemoLoading(null)
    } else if (result?.ok) {
      window.location.replace('/')
    }
  }

  return (
    <div
      className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'
      style={{
        backgroundImage: 'url(/images/background2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            {/* Demo Account Section */}
            <div className='flex flex-col gap-3'>
              <Typography variant='body2' className='text-center text-gray-600'>
                Quick Demo Access
              </Typography>
              <Box className='flex flex-col gap-2'>
                {demoAccounts.map(account => (
                  <Button
                    key={account.role}
                    variant='outlined'
                    color={account.color}
                    fullWidth
                    onClick={() => handleDemoLogin(account)}
                    disabled={isSubmitting || demoLoading !== null}
                    className='justify-between'
                  >
                    <span className='flex items-center gap-2'>
                      {demoLoading === account.role ? (
                        <CircularProgress size={16} color='inherit' />
                      ) : (
                        <i className='ri-user-line' />
                      )}
                      <span>Demo as {account.role}</span>
                    </span>
                    <Chip label={account.description} size='small' variant='outlined' className='text-xs' />
                  </Button>
                ))}
              </Box>
            </div>

            <Divider>OR</Divider>

            {/* Regular Login Form */}
            <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoComplete='username'
                fullWidth
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isSubmitting || demoLoading !== null}
              />
              <TextField
                fullWidth
                label='Password'
                type={isPasswordShown ? 'text' : 'password'}
                autoComplete='current-password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting || demoLoading !== null}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' edge='end' onClick={handleClickShowPassword}>
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {error && (
                <Typography color='error' variant='body2' className='text-center'>
                  {error}
                </Typography>
              )}
              <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || demoLoading !== null}>
                {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography variant='body2'>Don't have an account yet?</Typography>
                <Typography component={Link} href='/register' color='primary' variant='body2'>
                  Create an account
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
