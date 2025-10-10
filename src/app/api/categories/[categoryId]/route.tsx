// src/app/api/categories/[categoryId]/route.ts
import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PATCH(req: Request, { params }: { params: { categoryId: string } }) {
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

    const categoryToUpdate = await prisma.category.findFirst({
      where: {
        id: parseInt(params.categoryId),
        userId: session.user.id
      }
    })

    if (!categoryToUpdate) {
      return new NextResponse('Category not found or unauthorized', { status: 404 })
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: parseInt(params.categoryId)
      },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error)
    
return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE: Delete a specific category
export async function DELETE(req: Request, { params }: { params: { categoryId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 })
  }

  try {
    const categoryToDelete = await prisma.category.findFirst({
      where: {
        id: parseInt(params.categoryId),
        userId: session.user.id
      }
    })

    if (!categoryToDelete) {
      return new NextResponse('Category not found or unauthorized', { status: 404 })
    }

    await prisma.category.delete({
      where: {
        id: parseInt(params.categoryId)
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error)
    
return new NextResponse('Internal Error', { status: 500 })
  }
}
