import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Upload from '@/models/Upload'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import DashboardClient from './dashboard-client'

async function getDashboardData() {
  await connectDB()

  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) return { error: true }

  const isAdmin = decoded.role === 'admin'

  let stats = {}
  if (isAdmin) {
    const totalUsers = await User.countDocuments()
    const totalUploads = await Upload.countDocuments()
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalExpenses = expenseAgg[0]?.total || 0

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthAgg = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const thisMonthExpenses = thisMonthAgg[0]?.total || 0

    stats = { totalUsers, totalUploads, totalExpenses, thisMonthExpenses }
  } else {
    const visibleFilter = {
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    }

    const totalUploads = await Upload.countDocuments(visibleFilter)
    const expenseAgg = await Expense.aggregate([
      { $match: visibleFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalExpenses = expenseAgg[0]?.total || 0

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthAgg = await Expense.aggregate([
      { $match: { ...visibleFilter, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const thisMonthExpenses = thisMonthAgg[0]?.total || 0

    stats = { totalUploads, totalExpenses, thisMonthExpenses }
  }

  const recentExpenses = await Expense.find(
    isAdmin ? {} : {
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    }
  )
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(5)

  const recentUploads = await Upload.find(
    isAdmin ? {} : {
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    }
  )
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5)

  const expenseByCategory = await Expense.aggregate([
    ...(isAdmin ? [] : [
      { $match: {
        $or: [
          { visibleTo: { $size: 0 } },
          { visibleTo: decoded.userId },
          { visibleTo: { $exists: false } },
        ],
      }},
    ]),
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ])

  return {
    stats,
    recentExpenses: JSON.parse(JSON.stringify(recentExpenses)),
    recentUploads: JSON.parse(JSON.stringify(recentUploads)),
    expenseByCategory,
    role: decoded.role,
  }
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (data.error) {
    return <div className="text-soft p-8">Unable to load dashboard</div>
  }

  return <DashboardClient data={data} />
}
