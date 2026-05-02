import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Upload from '@/models/Upload'
import Expense from '@/models/Expense'
import { NextResponse } from 'next/server'

export async function GET(request) {
  await connectDB()

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

  const recentExpenses = await Expense.find()
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(5)

  const recentUploads = await Upload.find()
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5)

  const expenseByCategory = await Expense.aggregate([
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ])

  return NextResponse.json({
    stats: { totalUsers, totalUploads, totalExpenses, thisMonthExpenses },
    recentExpenses,
    recentUploads,
    expenseByCategory,
  })
}
