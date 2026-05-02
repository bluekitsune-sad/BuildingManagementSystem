import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const users = await User.find({}, '-password')
  return NextResponse.json(users)
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, email, password, role } = await request.json()
  const hashedPassword = await hashPassword(password)
  const user = await User.create({ name, email, password: hashedPassword, role })
  return NextResponse.json(user, { status: 201 })
}
