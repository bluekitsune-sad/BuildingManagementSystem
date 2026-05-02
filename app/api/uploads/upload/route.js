import { connectDB } from '@/lib/db/connect'
import { verifyToken } from '@/lib/auth/jwt'
import { uploadToCloudinary, validateUploadFile } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseMultipart(body, boundary) {
  const parts = body.split(`--${boundary}`)
  const result = {}

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const nameMatch = part.match(/name="([^"]+)"/)
      if (!nameMatch) continue
      const name = nameMatch[1]

      const filenameMatch = part.match(/filename="([^"]+)"/)
      const filename = filenameMatch ? filenameMatch[1] : null

      const bodyStart = part.indexOf('\r\n\r\n') || part.indexOf('\n\n')
      if (bodyStart === -1) continue
      const bodyEnd = part.lastIndexOf('\r\n') || part.lastIndexOf('\n')
      const content = part.slice(bodyStart + 4, bodyEnd > bodyStart ? bodyEnd : undefined)

      if (filename) {
        const contentType = part.match(/Content-Type: ([^\r\n]+)/)
        result.file = {
          buffer: Buffer.from(content, 'binary'),
          filename,
          type: contentType ? contentType[1] : 'application/octet-stream',
          size: Buffer.byteLength(content),
        }
      } else {
        result[name] = content.trim()
      }
    }
  }

  return result
}

export async function POST(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const boundary = contentType.split('boundary=')[1]
  const rawBody = await request.arrayBuffer()
  const body = Buffer.from(rawBody).toString('binary')
  const parsed = parseMultipart(body, boundary)

  if (!parsed.file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const validation = validateUploadFile({
    type: parsed.file.type,
    size: parsed.file.size,
  })
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { Readable } = await import('stream')
  const stream = Readable.from(parsed.file.buffer)

  try {
    const result = await uploadToCloudinary(stream)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
