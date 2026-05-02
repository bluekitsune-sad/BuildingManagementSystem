import { connectDB } from '@/lib/db/connect'
import User from '@/models/User'
import Expense from '@/models/Expense'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import ExpensesClient from './expenses-client'

async function getExpensesData() {
  await connectDB()

  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const decoded = verifyToken(token)

  if (!decoded) return { error: true }

  const isAdmin = decoded.role === 'admin'

  let expenses
  if (isAdmin) {
    expenses = await Expense.find()
      .populate('createdBy', 'name')
      .populate('visibleTo', 'name')
      .sort({ date: -1 })
  } else {
    expenses = await Expense.find({
      $or: [
        { visibleTo: { $size: 0 } },
        { visibleTo: decoded.userId },
        { visibleTo: { $exists: false } },
      ],
    })
      .populate('createdBy', 'name')
      .sort({ date: -1 })
  }

  const allUsers = isAdmin
    ? await User.find({}, '-password').sort({ name: 1 })
    : []

  return {
    expenses: JSON.parse(JSON.stringify(expenses)),
    allUsers: JSON.parse(JSON.stringify(allUsers)),
    role: decoded.role,
  }
}

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const data = await getExpensesData()

  if (data.error) {
    return <div className="text-soft p-8">Unable to load expenses</div>
  }

  return <ExpensesClient data={data} />
}
