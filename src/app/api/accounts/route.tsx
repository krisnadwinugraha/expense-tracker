// src/app/api/accounts/route.ts

import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '../auth/[...nextauth]/route' // Adjust path if needed

const prisma = new PrismaClient()

// GET: Fetch all accounts for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        currency: true // Also include currency details
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('[ACCOUNTS_GET]', error)
    
return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST: Create a new account for the logged-in user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, currencyId } = body

    if (!name || !currencyId) {
      return new NextResponse('Name and Currency ID are required', { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        name,
        currencyId,
        userId: session.user.id
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('[ACCOUNTS_POST]', error)
    
return new NextResponse('Internal Error', { status: 500 })
  }
}
