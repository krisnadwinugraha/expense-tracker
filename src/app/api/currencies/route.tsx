// src/app/api/currencies/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch all currencies
export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(currencies)
  } catch (error) {
    console.error('[CURRENCIES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST: Create a new currency
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, name, description, rate } = body

    if (!code || !name) {
      return new NextResponse('Code and Name are required', { status: 400 })
    }

    const currency = await prisma.currency.create({
      data: {
        code,
        name,
        description,
        rate
      }
    })

    return NextResponse.json(currency)
  } catch (error) {
    console.error('[CURRENCIES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
