// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import { Toaster } from 'sonner'
// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'Expense Tracker - Dashboard',
  description: 'Tracking Your Daily Expense.'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <AuthProvider>
          {children}
          <Toaster position='top-right' richColors />
        </AuthProvider>
      </body>
    </html>
  )
}

export default RootLayout
