'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/dashboard/uploads', label: 'Uploads' },
  { path: '/dashboard/expenses', label: 'Expenses' },
  { path: '/dashboard/users', label: 'Users' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="glass w-64 min-h-screen p-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light">BMS</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg ${
                pathname === item.path ? 'bg-accent' : 'hover:bg-secondary'
              }`}
            >
              {item.label}
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.aside>
  )
}
