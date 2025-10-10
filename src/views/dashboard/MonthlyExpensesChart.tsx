// src/views/dashboard/MonthlyExpensesChart.tsx
'use client'

import { useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import type { ApexOptions } from 'apexcharts'
import { Skeleton, Typography } from '@mui/material' // Import Skeleton and Typography

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const MonthlyExpensesChart = () => {
  const [chartData, setChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/charts?type=monthly_this_year')

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
    chart: { id: 'monthly-expenses-bar' },
    xaxis: { categories: chartData.labels },
    plotOptions: { bar: { borderRadius: 4, horizontal: false } },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: function (val) {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
        }
      }
    }
  }

  const series = [
    {
      name: 'Expenses',
      data: chartData.series
    }
  ]

  console.log('--- Monthly Chart Render ---', { loading, error, chartData })

  return (
    <Card>
      <CardHeader title='Monthly Expenses' subheader={`Expenses for ${new Date().getFullYear()}`} />
      <CardContent>
        {loading ? (
          <Skeleton variant='rectangular' height={350} />
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : (
          <ReactApexcharts options={options} series={series} type='bar' height={350} />
        )}
      </CardContent>
    </Card>
  )
}

export default MonthlyExpensesChart
