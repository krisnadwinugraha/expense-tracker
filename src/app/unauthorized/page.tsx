// src/app/unauthorized/page.tsx
import Link from 'next/link'
import { Button, Card, CardContent, Typography } from '@mui/material'

export default function UnauthorizedPage() {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen p-6'>
      <Card className='max-w-md w-full'>
        <CardContent className='p-8 text-center'>
          <Typography variant='h4' className='mb-4 font-bold'>
            Access Denied
          </Typography>
          <Typography variant='body1' className='mb-6 text-gray-600'>
            You don't have permission to access this page. Please contact your administrator if you believe this is an
            error.
          </Typography>
          <Button component={Link} href='/' variant='contained' color='primary' fullWidth>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
