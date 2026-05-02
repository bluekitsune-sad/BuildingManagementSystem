import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Upload from '@/models/Upload'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  await connectDB()
  const token = cookies().get('token')?.value
  const decoded = verifyToken(token)

  const userCount = await User.countDocuments()
  const uploadCount = await Upload.countDocuments()
  const expenseTotal = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-soft text-sm mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-light">{userCount}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-soft text-sm mb-2">Total Uploads</h3>
          <p className="text-3xl font-bold text-light">{uploadCount}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-soft text-sm mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-light">
            ${expenseTotal[0]?.total || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
