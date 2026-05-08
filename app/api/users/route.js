import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/hash'
import { NextResponse } from 'next/server'
import { cacheHeaders } from '@/lib/cache'

export async function GET(request) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const users = await User.find({}, '-password').sort({ name: 1 })

    const response = NextResponse.json(users)

    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('GET USERS ERROR:', error)

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()

    console.log('REQUEST BODY:', body)

    const { name, email, password, role } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: 'Name, email and password are required',
        },
        { status: 400 }
      )
    }

    // Existing user check
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('CREATE USER ERROR:', error)

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
