// src/views/dashboard/DailyExpensesChart.tsx
'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import { Skeleton, Typography } from '@mui/material'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const DailyExpensesChart = () => {
  const [chartData, setChartData] = useState<{ labels: any[]; series: any[] }>({ labels: [], series: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/charts?type=daily_this_month')

        // If the response is not OK, log the error and stop
        if (!res.ok) {
          const errorText = await res.text()
          console.error('API responded with an error:', res.status, errorText)
          setError('Failed to load chart data.')
          return
        }

        const data = await res.json()
        setChartData(data)
      } catch (e) {
        console.error('A network or JSON parsing error occurred:', e)
        setError('An error occurred while fetching data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const options: ApexOptions = {
    chart: { id: 'daily-expenses-line' },
    xaxis: {
      categories: chartData.labels,
      title: { text: `Days in ${new Date().toLocaleString('default', { month: 'long' })}` }
    },
    stroke: { curve: 'smooth' }
  }

  const series = [
    {
      name: 'Daily Expenses',
      data: chartData.series
    }
  ]

  // --- DEBUG LOG ---
  // This will show us the data right before rendering
  console.log('--- Daily Chart Render ---', { loading, error, chartData })

  return (
    <Card>
      <CardHeader title='Daily Expenses' subheader={`For the Current Month`} />
      <CardContent>
        {loading ? (
          <Skeleton variant='rectangular' height={350} />
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : (
          <ReactApexcharts options={options} series={series} type='line' height={350} />
        )}
      </CardContent>
    </Card>
  )
}

export default DailyExpensesChart
