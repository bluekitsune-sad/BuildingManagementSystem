import { verifyToken } from '@/lib/auth/jwt'
import { uploadToCloudinary, validateUploadFile } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request) {
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const validation = validateUploadFile({
    type: file.type,
    size: file.size,
  })
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const resourceType = file.type.startsWith('image/') ? 'image' : 'pdf'

    const result = await uploadToCloudinary(buffer, resourceType)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
