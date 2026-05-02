'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/dashboard/uploads', label: 'Uploads', icon: '📁' },
  { path: '/dashboard/expenses', label: 'Expenses', icon: '💰' },
  { path: '/dashboard/users', label: 'Users', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser).catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="glass w-64 min-h-screen p-6 flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light">BMS</h1>
        <p className="text-xs text-soft mt-1">Building Management</p>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg flex items-center gap-3 ${
                pathname === item.path ? 'bg-accent' : 'hover:bg-secondary'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="mt-6 pt-4 border-t border-secondary">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-light truncate">{user.name}</p>
              <p className="text-xs text-soft capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-primary w-full text-sm">
            Logout
          </button>
        </div>
      )}
    </motion.aside>
  )
}
