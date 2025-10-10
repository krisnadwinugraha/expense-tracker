// src/views/dashboard/StatCard.tsx
'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

type StatCardProps = {
  title: string
  value: string
  icon: string
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

const StatCard = ({ title, value, icon, color = 'primary' }: StatCardProps) => {
  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <Typography variant='body2'>{title}</Typography>
          <Typography variant='h5'>{value}</Typography>
        </div>
        <Avatar variant='rounded' className={`bg-${color}-main text-white`}>
          <i className={icon} />
        </Avatar>
      </CardContent>
    </Card>
  )
}

export default StatCard
