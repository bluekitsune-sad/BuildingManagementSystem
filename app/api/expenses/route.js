import { connectDB } from '@/lib/db/connect'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expenses = await Expense.find().populate('createdBy', 'name').sort({ date: -1 })
  return NextResponse.json(expenses)
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, amount, category } = await request.json()
  const expense = await Expense.create({
    title,
    amount,
    category,
    createdBy: decoded.userId,
  })

  return NextResponse.json(expense, { status: 201 })
}
