import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { hashPassword } from '@/lib/auth/hash'
import { NextResponse } from 'next/server'

export async function POST(request) {
  await connectDB()
  const { name, email, password } = await request.json()

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  const hashedPassword = await hashPassword(password)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'resident',
  })

  return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
}
