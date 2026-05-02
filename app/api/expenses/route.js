import { connectDB } from '@/lib/db/connect'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { expenseSchema } from '@/lib/validators/expense'
import { NextResponse } from 'next/server'
import { cacheHeaders } from '@/lib/cache'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let expenses
  if (decoded.role === 'admin') {
    expenses = await Expense.find()
      .populate('createdBy', 'name')
      .populate('visibleTo', 'name')
      .sort({ date: -1 })
  } else {
    expenses = await Expense.find({
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    })
      .populate('createdBy', 'name')
      .sort({ date: -1 })
  }

  const response = NextResponse.json(expenses)
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const validation = expenseSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const { title, amount, category, otherCategory, date, visibleTo } = validation.data
  const expense = await Expense.create({
    title,
    amount,
    category,
    otherCategory: category === 'others' ? otherCategory?.trim() : undefined,
    createdBy: decoded.userId,
    date: date || Date.now(),
    visibleTo: visibleTo || [],
  })

  const populated = await Expense.findById(expense._id)
    .populate('createdBy', 'name')
    .populate('visibleTo', 'name')

  return NextResponse.json(populated, { status: 201 })
}
