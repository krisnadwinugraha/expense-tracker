// src/app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// GET: Fetch the current user's profile
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      // Exclude the password hash from the response
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[PROFILE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PATCH: Update the current user's profile
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, password } = body

    const dataToUpdate: { name?: string; password?: string } = {}

    if (name) {
      dataToUpdate.name = name
    }

    // If a new password is provided, hash it before updating
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[PROFILE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
