// src/app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: Fetch all categories for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('[CATEGORIES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST: Create a new category for the logged-in user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description }: { name: string; description?: string } = body

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        userId: session.user.id
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
