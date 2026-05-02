import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/hash'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, email, password, role } = await request.json()
  const updateData = { name, email, role }

  if (password) {
    updateData.password = await hashPassword(password)
  }

  const user = await User.findByIdAndUpdate(params.id, updateData, { new: true })
  return NextResponse.json(user)
}

export async function DELETE(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await User.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'User deleted' })
}
