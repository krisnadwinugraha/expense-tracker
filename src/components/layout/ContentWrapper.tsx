'use client'

import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

type ContentWrapperProps = {
  children: ReactNode
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <Box
      className='layout-content-wrapper'
      sx={{
        position: 'relative',
        zIndex: 1,
        p: { xs: 4, md: 6 }
      }}
    >
      {children}
    </Box>
  )
}
