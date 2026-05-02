'use client'
import { motion } from 'framer-motion'

export function CardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="card p-6"
    >
      <div className="h-4 bg-secondary rounded w-3/4 mb-4" />
      <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
      <div className="h-3 bg-secondary rounded w-2/3" />
    </motion.div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          className="card p-4 flex justify-between"
        >
          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded w-48" />
            <div className="h-3 bg-secondary rounded w-32" />
          </div>
          <div className="h-8 w-20 bg-secondary rounded" />
        </motion.div>
      ))}
    </div>
  )
}
