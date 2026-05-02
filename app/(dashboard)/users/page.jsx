'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'resident' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/users/${editingId}` : '/api/users'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const updated = await fetch('/api/users').then(r => r.json())
      setUsers(updated)
      setForm({ name: '', email: '', password: '', role: 'resident' })
      setEditingId(null)
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers(users.filter(u => u._id !== id))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">User Management</h1>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="card p-6 mb-8 space-y-4"
      >
        <input
          placeholder="Name"
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
        <select
          className="input-field"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="resident">Resident</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-primary">
          {editingId ? 'Update' : 'Create'} User
        </button>
      </motion.form>

      <div className="space-y-4">
        {users.map(user => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-light">{user.name}</p>
              <p className="text-sm text-soft">{user.email} - {user.role}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setForm({ name: user.name, email: user.email, role: user.role, password: '' })
                  setEditingId(user._id)
                }}
                className="btn-primary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user._id)}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
