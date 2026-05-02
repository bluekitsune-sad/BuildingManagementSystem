'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IoGridOutline, IoFolderOutline, IoCashOutline, IoPeopleOutline, IoMenu, IoClose } from 'react-icons/io5'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: IoGridOutline },
  { path: '/dashboard/uploads', label: 'Uploads', icon: IoFolderOutline },
  { path: '/dashboard/expenses', label: 'Expenses', icon: IoCashOutline },
  { path: '/dashboard/users', label: 'Users', icon: IoPeopleOutline },
]

function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className="space-y-2 flex-1">
      {menuItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-3 rounded-lg flex items-center gap-3 ${
              pathname === item.path ? 'bg-accent' : 'hover:bg-secondary'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </motion.div>
        </Link>
      ))}
    </nav>
  )
}

function UserSection() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser).catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="mt-6 pt-4 border-t border-secondary">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-light truncate">{user.name}</p>
          <p className="text-xs text-soft capitalize">{user.role}</p>
        </div>
      </div>
      <button onClick={handleLogout} className="btn-primary w-full text-sm">Logout</button>
    </div>
  )
}

function SidebarContent() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light">BMS</h1>
        <p className="text-xs text-soft mt-1">Building Management</p>
      </div>
      <NavLinks />
      <UserSection />
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Header - only on small screens */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded hover:bg-secondary">
          <IoMenu className="w-6 h-6 text-light" />
        </button>
        <h1 className="text-lg font-bold text-light">BMS</h1>
        <div className="w-10" />
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - animated, hidden on lg+ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-0 left-0 z-50 glass w-64 h-full p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-light">Menu</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded hover:bg-secondary">
                <IoClose className="w-5 h-5 text-light" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible on lg+, NO framer-motion transform */}
      <aside className="hidden lg:flex lg:flex-col glass w-64 min-h-screen p-6 shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}
