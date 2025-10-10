// src/app/(main)/page.tsx
import { headers } from 'next/headers'

import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/libs/auth'

// Import your existing dashboard view
import DashboardAnalytics from '@views/dashboard/Analytics'

// Define the type for the data we expect from the API
type SummaryData = {
  totalIncome: number
  totalExpense: number
  netIncome: number
  totalBalance: number
}

async function getSummaryData(): Promise<SummaryData> {
  // We need to forward the user's cookie to the API route so it knows who is logged in
  const cookie = headers().get('cookie') ?? ''
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/summary`, {
    headers: { cookie }
  })

  if (!res.ok) {
    console.error('Failed to fetch summary data')

    return { totalIncome: 0, totalExpense: 0, netIncome: 0, totalBalance: 0 }
  }

  return res.json()
}

const DashboardPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <p>Please log in.</p>
  }

  const summaryData = await getSummaryData()

  return <DashboardAnalytics summaryData={summaryData} />
}

export default DashboardPage
