import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Upload from '@/models/Upload'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import UploadsClient from './uploads-client'

async function getUploadsData() {
  await connectDB()

  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) return { error: true }

  const isAdmin = decoded.role === 'admin'

  let uploads
  if (isAdmin) {
    uploads = await Upload.find()
      .populate('uploadedBy', 'name')
      .populate('visibleTo', 'name')
      .sort({ createdAt: -1 })
  } else {
    uploads = await Upload.find({
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
  }

  const allUsers = isAdmin
    ? await User.find({}, '-password').sort({ name: 1 })
    : []

  return {
    uploads: JSON.parse(JSON.stringify(uploads)),
    allUsers: JSON.parse(JSON.stringify(allUsers)),
    role: decoded.role,
  }
}

export const dynamic = 'force-dynamic'

export default async function UploadsPage() {
  const data = await getUploadsData()

  if (data.error) {
    return <div className="text-soft p-8">Unable to load uploads</div>
  }

  return <UploadsClient data={data} />
}
