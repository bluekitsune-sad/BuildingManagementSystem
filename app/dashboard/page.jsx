'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [data, setData] = useState({ stats: {}, recentExpenses: [], recentUploads: [], expenseByCategory: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-soft p-8">Loading dashboard...</div>

  const { stats, recentExpenses, recentUploads, expenseByCategory } = data

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers || 0} />
        <StatCard label="Total Uploads" value={stats.totalUploads || 0} />
        <StatCard label="Total Expenses" value={`$${(stats.totalExpenses || 0).toLocaleString()}`} />
        <StatCard label="This Month" value={`$${(stats.thisMonthExpenses || 0).toLocaleString()}`} />
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
                    <p className="text-soft text-xs">{exp.category} · {new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-accent font-semibold">${exp.amount}</span>
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
                    <p className="text-soft text-xs capitalize">{upload.category} · {upload.type}</p>
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
                      <span className="capitalize text-light">{cat._id}</span>
                      <span className="text-soft">${cat.total} ({percentage}%)</span>
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
            <Link href="/dashboard/expenses" className="btn-primary text-center block">Add Expense</Link>
            <Link href="/dashboard/uploads" className="btn-primary text-center block">Add Upload</Link>
            <Link href="/dashboard/users" className="btn-primary text-center block">Manage Users</Link>
            <Link href="/dashboard/expenses" className="btn-primary text-center block">View Reports</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card p-6">
      <p className="text-soft text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-light">{value}</p>
    </div>
  )
}
