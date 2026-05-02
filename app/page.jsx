import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl font-bold mb-6 text-light">
          Building Management System
        </h1>
        <p className="text-xl mb-8 text-soft">
          A modern platform for building committees and residents to manage expenses,
          utilities, and shared data securely.
        </p>
        <div className="space-x-4">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-3"
            >
              Login
            </motion.button>
          </Link>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary bg-secondary text-lg px-8 py-3"
            >
              Register
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
