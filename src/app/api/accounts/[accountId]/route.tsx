// src/app/api/accounts/[accountId]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route' // Adjust path

const prisma = new PrismaClient()

// PATCH: Update a specific account
export async function PATCH(req: Request, { params }: { params: { accountId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, currencyId }: { name: string; currencyId: number } = body

    if (!name || !currencyId) {
      return new NextResponse('Name and Currency ID are required', { status: 400 })
    }

    // Security Check: Ensure the account belongs to the logged-in user
    const accountToUpdate = await prisma.account.findFirst({
      where: {
        id: params.accountId,
        userId: session.user.id
      }
    })

    if (!accountToUpdate) {
      return new NextResponse('Account not found or unauthorized', { status: 404 })
    }

    const updatedAccount = await prisma.account.update({
      where: {
        id: params.accountId
      },
      data: {
        name,
        currencyId
      }
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error('[ACCOUNT_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE: Delete a specific account and all its transactions
export async function DELETE(req: Request, { params }: { params: { accountId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    // Security Check: Ensure the account belongs to the logged-in user
    const accountToDelete = await prisma.account.findFirst({
      where: {
        id: params.accountId,
        userId: session.user.id
      }
    })

    if (!accountToDelete) {
      return new NextResponse('Account not found or unauthorized', { status: 404 })
    }

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      // 1. First, delete all transactions associated with this account
      prisma.transaction.deleteMany({
        where: {
          accountId: params.accountId
        }
      }),
      // 2. Then, delete the account itself
      prisma.account.delete({
        where: {
          id: params.accountId
        }
      })
    ])

    return new NextResponse(null, { status: 204 }) // Success, no content
  } catch (error) {
    console.error('[ACCOUNT_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
