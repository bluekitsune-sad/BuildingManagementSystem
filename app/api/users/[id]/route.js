import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/hash'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    await connectDB()

    const token = request.cookies.get('token')?.value
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, email, password, role, permissions } = await request.json()
    const updateData = {}

    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (permissions !== undefined) updateData.permissions = permissions

    if (email !== undefined) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 409 }
        )
      }
      updateData.email = email
    }

    if (password) {
      updateData.password = await hashPassword(password)
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('UPDATE USER ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await connectDB()

    const token = request.cookies.get('token')?.value
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted' })
  } catch (error) {
    console.error('DELETE USER ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
