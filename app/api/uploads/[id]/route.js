import { connectDB } from '@/lib/db/connect'
import Upload from '@/models/Upload'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await Upload.findByIdAndDelete(params.id)
  return NextResponse.json({ message: 'Upload deleted' })
}
