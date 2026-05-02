import { connectDB } from '@/lib/db/connect'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { expenseUpdateSchema } from '@/lib/validators/expense'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validation = expenseUpdateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const expense = await Expense.findById(params.id)
  if (!expense) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (decoded.role !== 'admin' && expense.createdBy.toString() !== decoded.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData = { ...validation.data, updatedBy: decoded.userId }
  if (body.date && !body.date.includes && body.date !== '') {
    updateData.date = body.date
  }

  const updated = await Expense.findByIdAndUpdate(
    params.id,
    updateData,
    { new: true }
  ).populate('createdBy', 'name').populate('visibleTo', 'name')

  return NextResponse.json(updated)
}

export async function DELETE(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expense = await Expense.findById(params.id)
  if (!expense) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (decoded.role !== 'admin' && expense.createdBy.toString() !== decoded.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await Expense.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Expense deleted' })
}
