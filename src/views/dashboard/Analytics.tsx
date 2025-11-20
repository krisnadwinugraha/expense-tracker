// src/views/dashboard/Analytics.tsx
'use client'

import Grid from '@mui/material/Grid'

import StatCard from './StatCard'

// import MonthlyExpensesChart from './MonthlyExpensesChart'
// import DailyExpensesChart from './DailyExpensesChart'

type SummaryData = {
  totalIncome: number
  totalExpense: number
  netIncome: number
  totalBalance: number
}

const DashboardAnalytics = ({ summaryData }: { summaryData: SummaryData }) => {
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Income This Month'
          value={formatter.format(summaryData.totalIncome)}
          icon='ri-arrow-up-s-line'
          color='success'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Expense This Month'
          value={formatter.format(summaryData.totalExpense)}
          icon='ri-arrow-down-s-line'
          color='error'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Net Profit'
          value={formatter.format(summaryData.netIncome)}
          icon='ri-line-chart-line'
          color='primary'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Total Balance'
          value={formatter.format(summaryData.totalBalance)}
          icon='ri-wallet-3-line'
          color='warning'
        />
      </Grid>
      {/* --- End of Dynamic Stat Cards --- */}

      {/* You can keep other components from the template
      <Grid item xs={12} md={8}>
        <MonthlyExpensesChart />
      </Grid>
      <Grid item xs={12} md={4}>
        <DailyExpensesChart />
      </Grid> */}
    </Grid>
  )
}

export default DashboardAnalytics
