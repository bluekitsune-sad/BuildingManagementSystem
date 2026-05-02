'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { loginSchema } from '@/lib/validators/auth'
import { setCookie } from 'cookies-next'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (res.ok) {
      setCookie('token', data.token)
      router.push('/dashboard')
    } else {
      setError(data.error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-light">Login</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-accent hover:text-soft">
            Register
          </a>
        </p>
      </div>
    </motion.div>
  )
}
