import { connectDB } from '@/lib/db/connect'
import Upload from '@/models/Upload'
import { verifyToken } from '@/lib/auth/jwt'
import { uploadSchema } from '@/lib/validators/upload'
import { NextResponse } from 'next/server'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let uploads
  if (decoded.role === 'admin') {
    uploads = await Upload.find().populate('uploadedBy', 'name').populate('visibleTo', 'name').sort({ createdAt: -1 })
  } else {
    uploads = await Upload.find({
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    }).populate('uploadedBy', 'name').sort({ createdAt: -1 })
  }

  return NextResponse.json(uploads)
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const validation = uploadSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const { title, fileUrl, category, otherCategory, visibleTo } = validation.data

  const upload = await Upload.create({
    title,
    fileUrl,
    type: fileUrl.includes('image') ? 'image' : 'pdf',
    category,
    otherCategory: category === 'others' ? otherCategory : undefined,
    uploadedBy: decoded.userId,
    visibleTo: visibleTo || [],
  })

  return NextResponse.json(upload, { status: 201 })
}
