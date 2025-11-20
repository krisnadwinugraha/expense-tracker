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
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

import themeConfig from '@configs/themeConfig'

const Login = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
            <form noValidate onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                autoComplete='username'
                fullWidth
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label='Password'
                type={isPasswordShown ? 'text' : 'password'}
                autoComplete='current-password'
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'></div>
              <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Don't have an account yet?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create an account
                </Typography>
              </div>
              <Divider className='gap-3'>Demo</Divider>
              <div className='text-center'>
                <Typography variant='body2'>
                  Email: <span className='font-medium'>admin@gmail.com</span>
                </Typography>
                <Typography variant='body2'>
                  Password: <span className='font-medium'>123456</span>
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
