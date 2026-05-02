import { connectDB } from '@/lib/db/connect'
import Upload from '@/models/Upload'
import { verifyToken } from '@/lib/auth/jwt'
import { uploadUpdateSchema } from '@/lib/validators/upload'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const validation = uploadUpdateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
  }

  const updateData = { ...validation.data, updatedBy: decoded.userId }
  if (validation.data.category !== 'others') {
    updateData.otherCategory = undefined
  }
  if (validation.data.fileUrl) {
    updateData.type = validation.data.fileUrl.includes('image') ? 'image' : 'pdf'
  }

  const upload = await Upload.findByIdAndUpdate(
    params.id,
    updateData,
    { new: true }
  ).populate('uploadedBy', 'name').populate('visibleTo', 'name')

  if (!upload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(upload)
}

export async function DELETE(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const upload = await Upload.findById(params.id)
  if (!upload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await Upload.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Upload deleted' })
}
