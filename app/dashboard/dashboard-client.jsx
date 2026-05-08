'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { IoPeopleOutline, IoFolderOutline, IoCashOutline, IoTrendingUpOutline, IoAddOutline, IoListOutline } from 'react-icons/io5'
import { formatCurrency } from '@/lib/utils'

const statsConfig = {
  totalUsers: { label: 'Total Users', icon: IoPeopleOutline, color: 'text-purple-400' },
  totalUploads: { label: 'Total Uploads', icon: IoFolderOutline, color: 'text-blue-400' },
  totalExpenses: { label: 'Total Expenses', icon: IoCashOutline, color: 'text-green-400' },
  thisMonthExpenses: { label: 'This Month', icon: IoTrendingUpOutline, color: 'text-accent' },
}

const adminQuickActions = [
  { label: 'Add Expense', href: '/dashboard/expenses', icon: IoAddOutline },
  { label: 'Add Upload', href: '/dashboard/uploads', icon: IoAddOutline },
  { label: 'Manage Users', href: '/dashboard/users', icon: IoListOutline },
  { label: 'View Reports', href: '/dashboard/expenses', icon: IoListOutline },
]

const residentQuickActions = [
  { label: 'View Expenses', href: '/dashboard/expenses', icon: IoListOutline },
  { label: 'View Uploads', href: '/dashboard/uploads', icon: IoListOutline },
]

export default function DashboardClient({ data }) {
  const { stats, recentExpenses, recentUploads, expenseByCategory, role } = data
  const isAdmin = role === 'admin'
  const displayStats = Object.entries(stats).filter(([key]) => statsConfig[key])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">
        Welcome {isAdmin ? 'Back, Admin' : 'Back'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map(([key, value], i) => {
          const config = statsConfig[key]
          const Icon = config.icon
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-soft text-sm">{config.label}</p>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <p className="text-3xl font-bold text-light">
                {typeof value === 'number' && (key.includes('Expenses') || key.includes('Month'))
                  ? formatCurrency(value)
                  : value}
              </p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-light">Recent Expenses</h2>
            <Link href="/dashboard/expenses" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-soft text-sm">No expenses yet</p>
            ) : (
              recentExpenses.map(exp => (
                <div key={exp._id} className="flex justify-between items-center py-2 border-b border-secondary">
                  <div>
                    <p className="text-light text-sm font-medium">{exp.title}</p>
                    <p className="text-soft text-xs">
                      {exp.category === 'others' ? (exp.otherCategory || 'Other') : exp.category}
                      {' · '}
                      {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-accent font-semibold">{formatCurrency(exp.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-light">Recent Uploads</h2>
            <Link href="/dashboard/uploads" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUploads.length === 0 ? (
              <p className="text-soft text-sm">No uploads yet</p>
            ) : (
              recentUploads.map(upload => (
                <div key={upload._id} className="flex justify-between items-center py-2 border-b border-secondary">
                  <div>
                    <p className="text-light text-sm font-medium">{upload.title}</p>
                    <p className="text-soft text-xs capitalize">
                      {upload.category === 'others' ? (upload.otherCategory || 'Other') : upload.category}
                      {' · '}
                      {upload.type}
                    </p>
                  </div>
                  <span className="text-soft text-xs">{new Date(upload.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense by Category */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-light mb-4">Expenses by Category</h2>
          <div className="space-y-3">
            {expenseByCategory.length === 0 ? (
              <p className="text-soft text-sm">No data yet</p>
            ) : (
              expenseByCategory.map(cat => {
                const percentage = stats.totalExpenses ? (cat.total / stats.totalExpenses * 100).toFixed(0) : 0
                return (
                  <div key={cat._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-light">
                        {cat._id === 'others' ? 'Other' : cat._id}
                      </span>
                      <span className="text-soft">{formatCurrency(cat.total)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-light mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {(isAdmin ? adminQuickActions : residentQuickActions).map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <ActionIcon className="w-4 h-4" />
                  {action.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
