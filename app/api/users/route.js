import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'
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

    const response = NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 }
    )

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

    const { name, email, password, role } = body

    console.log('REQUEST BODY:', body)

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: 'Name, email and password are required',
        },
        { status: 400 }
      )
    }

    // Check duplicate user
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
        },
        { status: 409 }
      )
    }

    // Create user (password will be hashed by Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'resident',
    })

    // IMPORTANT: convert to safe plain object (prevents Vercel 500 crash)
    const safeUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
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
