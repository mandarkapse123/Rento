"use server"

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addRent(data: any) {
  await prisma.rent.create({ data })
  revalidatePath('/')
}

export async function deleteRent(id: string) {
  await prisma.rent.delete({ where: { id } })
  revalidatePath('/')
}

export async function addExpense(data: any) {
  await prisma.expense.create({ data })
  revalidatePath('/')
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
  revalidatePath('/')
}

export async function addReceipt(data: any) {
  await prisma.receipt.create({ data })
  revalidatePath('/')
}

export async function deleteReceipt(id: string) {
  await prisma.receipt.delete({ where: { id } })
  revalidatePath('/')
}

export async function clearAllData() {
  await prisma.rent.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.receipt.deleteMany({})
  revalidatePath('/')
}