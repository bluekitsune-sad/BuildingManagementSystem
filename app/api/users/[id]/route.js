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

  const { name, email, password, role, permissions } = await request.json()
  const updateData = {}

  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email
  if (role !== undefined) updateData.role = role
  if (permissions !== undefined) updateData.permissions = permissions
  if (password) {
    updateData.password = await hashPassword(password)
  }

  const user = await User.findByIdAndUpdate(params.id, updateData, { new: true }).select('-password')
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
