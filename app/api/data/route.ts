import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  const [rents, expenses, receipts] = await Promise.all([
    prisma.rent.findMany({ orderBy: { date: 'desc' } }),
    prisma.expense.findMany({ orderBy: { date: 'desc' } }),
    prisma.receipt.findMany({ orderBy: { createdAt: 'desc' } })
  ])
  return NextResponse.json({ rents, expenses, receipts })
}