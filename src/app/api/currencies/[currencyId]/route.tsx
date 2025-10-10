// src/app/api/currencies/[currencyId]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH: Update a specific currency
export async function PATCH(req: Request, { params }: { params: { currencyId: string } }) {
  try {
    const body = await req.json()
    const { code, name, description, rate } = body

    if (!code || !name) {
      return new NextResponse('Code and Name are required', { status: 400 })
    }

    const updatedCurrency = await prisma.currency.update({
      where: { id: parseInt(params.currencyId) },
      data: { code, name, description, rate }
    })

    return NextResponse.json(updatedCurrency)
  } catch (error) {
    console.error('[CURRENCY_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE: Delete a specific currency
export async function DELETE(req: Request, { params }: { params: { currencyId: string } }) {
  try {
    // Safety Check: Prevent deleting a currency if it's being used by an account
    const accountsUsingCurrency = await prisma.account.count({
      where: { currencyId: parseInt(params.currencyId) }
    })

    if (accountsUsingCurrency > 0) {
      return new NextResponse('Cannot delete currency as it is currently in use by an account.', { status: 400 })
    }

    await prisma.currency.delete({
      where: { id: parseInt(params.currencyId) }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CURRENCY_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
