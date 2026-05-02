import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { comparePassword } from '@/lib/auth/hash'
import { signToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export async function POST(request) {
  await connectDB()
  const { email, password } = await request.json()

  const user = await User.findOne({ email })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const isValid = await comparePassword(password, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ userId: user._id, role: user.role })
  return NextResponse.json({ token, role: user.role })
}
