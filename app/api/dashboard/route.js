import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Upload from '@/models/Upload'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'
import { cacheHeaders } from '@/lib/cache'

export async function GET(request) {
  await connectDB()
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = decoded.role === 'admin'

  // Stats
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

  // Recent items
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

  // Category breakdown
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

  const response = NextResponse.json({
    stats,
    recentExpenses,
    recentUploads,
    expenseByCategory,
    role: decoded.role,
  })
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
