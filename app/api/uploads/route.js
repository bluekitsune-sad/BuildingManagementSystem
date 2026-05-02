import { connectDB } from '@/lib/db/connect'
import Upload from '@/models/Upload'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (decoded.role === 'admin') {
    const uploads = await Upload.find().populate('uploadedBy', 'name')
    return NextResponse.json(uploads)
  } else {
    const uploads = await Upload.find({
      $or: [{ visibleTo: decoded.userId }, { uploadedBy: decoded.userId }],
    }).populate('uploadedBy', 'name')
    return NextResponse.json(uploads)
  }
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { title, fileUrl, type, category, visibleTo } = await request.json()
  const upload = await Upload.create({
    title,
    fileUrl,
    type,
    category,
    uploadedBy: decoded.userId,
    visibleTo,
  })

  return NextResponse.json(upload, { status: 201 })
}
