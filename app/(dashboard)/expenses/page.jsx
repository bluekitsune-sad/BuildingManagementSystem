'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ title: '', amount: '', category: 'maintenance' })

  useEffect(() => {
    fetch('/api/expenses').then(res => res.json()).then(setExpenses)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    if (res.ok) {
      const updated = await fetch('/api/expenses').then(r => r.json())
      setExpenses(updated)
      setForm({ title: '', amount: '', category: 'maintenance' })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">Expenses</h1>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="card p-6 mb-8 space-y-4"
      >
        <input
          placeholder="Title"
          className="input-field"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          className="input-field"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          className="input-field"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="maintenance">Maintenance</option>
          <option value="utility">Utility</option>
          <option value="gas">Gas</option>
          <option value="others">Others</option>
        </select>
        <button type="submit" className="btn-primary w-full">Add Expense</button>
      </motion.form>

      <div className="space-y-4">
        {expenses.map(expense => (
          <motion.div
            key={expense._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-light">{expense.title}</p>
              <p className="text-sm text-soft">
                ${expense.amount} - {expense.category} - {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm text-soft">By: {expense.createdBy?.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
