'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { validators } from '@/lib/validators/helpers'
import { formatCurrency } from '@/lib/utils'

export default function ExpensesClient({ data }) {
  const [expenses, setExpenses] = useState(data.expenses)
  const [allUsers, setAllUsers] = useState(data.allUsers)
  const [form, setForm] = useState({ title: '', amount: '', category: 'utility', otherCategory: '', date: '', visibleTo: [] })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState({ category: 'all', search: '' })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const isAdmin = data.role === 'admin'

  function validateField(name, value) {
    const v = validators
    const rules = {
      title: v.chain(v.required('Title is required'), v.maxLength(100, 'Title must be under 100 characters')),
      amount: v.chain(v.required('Amount is required'), v.positiveNumber('Must be a positive number'), v.maxNumber(1000000, 'Cannot exceed Rs. 1,000,000')),
      otherCategory: form.category === 'others' ? v.chain(v.required('Category name is required'), v.maxLength(50, 'Must be under 50 characters')) : () => '',
    }
    if (rules[name]) {
      const err = rules[name](value)
      setFieldErrors(prev => ({ ...prev, [name]: err }))
      return err
    }
    return ''
  }

  function validateAll() {
    const v = validators
    const errors = {}
    const titleErr = v.chain(v.required('Title is required'), v.maxLength(100, 'Title must be under 100 characters'))(form.title)
    const amountErr = v.chain(v.required('Amount is required'), v.positiveNumber('Must be a positive number'), v.maxNumber(1000000, 'Cannot exceed Rs. 1,000,000'))(form.amount)
    const otherErr = form.category === 'others' ? v.chain(v.required('Category name is required'), v.maxLength(50, 'Must be under 50 characters'))(form.otherCategory) : ''

    if (titleErr) errors.title = titleErr
    if (amountErr) errors.amount = amountErr
    if (otherErr) errors.otherCategory = otherErr

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!validateAll()) return

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        otherCategory: form.category === 'others' ? form.otherCategory.trim() : undefined,
        date: form.date || undefined,
        visibleTo: form.visibleTo || [],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || 'Failed to save expense')
      return
    }

    const res2 = await fetch('/api/expenses')
    const updated = await res2.json()
    setExpenses(updated)
    resetForm()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    setExpenses(expenses.filter(e => e._id !== id))
  }

  function handleEdit(expense) {
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      otherCategory: expense.otherCategory || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      visibleTo: expense.visibleTo ? expense.visibleTo.map(v => v._id || v) : [],
    })
    setEditingId(expense._id)
    setShowForm(true)
    setFormError('')
    setFieldErrors({})
  }

  function resetForm() {
    setForm({ title: '', amount: '', category: 'utility', otherCategory: '', date: '', visibleTo: [] })
    setEditingId(null)
    setShowForm(false)
    setFormError('')
    setFieldErrors({})
  }

  function handleFieldChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      validateField(name, value)
    }
  }

  function toggleUser(userId) {
    setForm(prev => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(userId)
        ? prev.visibleTo.filter(id => id !== userId)
        : [...prev.visibleTo, userId],
    }))
  }

  function toggleAllUsers() {
    const userIds = allUsers.map(u => u._id)
    const allSelected = userIds.every(id => form.visibleTo.includes(id))
    setForm(prev => ({
      ...prev,
      visibleTo: allSelected ? [] : userIds,
    }))
  }

  function toggleByRole(role) {
    const roleUserIds = allUsers.filter(u => u.role === role).map(u => u._id)
    const allSelected = roleUserIds.every(id => form.visibleTo.includes(id))
    setForm(prev => ({
      ...prev,
      visibleTo: allSelected
        ? prev.visibleTo.filter(id => !roleUserIds.includes(id))
        : [...new Set([...prev.visibleTo, ...roleUserIds])],
    }))
  }

  const filtered = expenses.filter(exp => {
    const matchCat = filter.category === 'all' || exp.category === filter.category
    const matchSearch = exp.title.toLowerCase().includes(filter.search.toLowerCase())
    return matchCat && matchSearch
  })

  const totalAmount = filtered.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light">Expenses</h1>
        {isAdmin && (
          <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search expenses..."
          className="input-field w-64"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <select
          className="input-field w-48"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="utility">Utility</option>
          <option value="gas">Gas</option>
          <option value="maintenance">Maintenance</option>
          <option value="others">Others</option>
        </select>
        <span className="text-lg font-semibold text-accent ml-auto">
          Total: {formatCurrency(totalAmount)} ({filtered.length})
        </span>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="card p-6 mb-8 space-y-4 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-light">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>

            {formError && (
              <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{formError}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-soft">Title <span className="text-red-400">*</span></label>
                <input
                  placeholder="Title (max 100 chars)"
                  className={`input-field ${fieldErrors.title ? 'border-red-400' : ''}`}
                  value={form.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => validateField('title', form.title)}
                  maxLength={100}
                />
                {fieldErrors.title && <p className="text-xs text-red-400">{fieldErrors.title}</p>}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-soft">Amount <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  placeholder="Amount"
                  className={`input-field ${fieldErrors.amount ? 'border-red-400' : ''}`}
                  value={form.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  onBlur={() => validateField('amount', form.amount)}
                />
                {fieldErrors.amount && <p className="text-xs text-red-400">{fieldErrors.amount}</p>}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-soft">Category <span className="text-red-400">*</span></label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                >
                  <option value="utility">Utility</option>
                  <option value="gas">Gas</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-soft">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
              </div>
            </div>

            {/* Other Category - shown when "Others" selected */}
            <AnimatePresence>
              {form.category === 'others' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-sm text-soft">Category Name <span className="text-red-400">*</span></label>
                    <input
                      placeholder="e.g. Internet, Security, Landscaping..."
                      className={`input-field ${fieldErrors.otherCategory ? 'border-red-400' : ''}`}
                      value={form.otherCategory}
                      onChange={(e) => handleFieldChange('otherCategory', e.target.value)}
                      onBlur={() => validateField('otherCategory', form.otherCategory)}
                      maxLength={50}
                    />
                    {fieldErrors.otherCategory && <p className="text-xs text-red-400">{fieldErrors.otherCategory}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visibility Control */}
            <div className="border-t border-secondary pt-4">
              <label className="block text-soft text-sm mb-3">Visible To (leave empty for all)</label>

              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => toggleByRole('admin')} className="text-xs px-3 py-1 rounded bg-accent/30 text-accent hover:bg-accent/50">
                  Toggle All Admins
                </button>
                <button type="button" onClick={() => toggleByRole('resident')} className="text-xs px-3 py-1 rounded bg-secondary text-soft hover:bg-secondary/80">
                  Toggle All Residents
                </button>
                <button type="button" onClick={toggleAllUsers} className="text-xs px-3 py-1 rounded bg-secondary text-soft hover:bg-secondary/80">
                  Toggle All Users
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {allUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer">
                    <input type="checkbox" checked={form.visibleTo.includes(u._id)} onChange={() => toggleUser(u._id)} className="accent-accent" />
                    <span className="text-sm text-light">{u.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${u.role === 'admin' ? 'bg-accent/30 text-accent' : 'bg-secondary text-soft'}`}>
                      {u.role}
                    </span>
                  </label>
                ))}
              </div>
              {allUsers.length === 0 && <p className="text-sm text-soft">No users available</p>}
              {form.visibleTo.length === 0 && <p className="text-xs text-soft mt-2 italic">No users selected - visible to everyone</p>}
              {form.visibleTo.length > 0 && <p className="text-xs text-soft mt-2">{form.visibleTo.length} user(s) selected</p>}
            </div>

            <button type="submit" className="btn-primary w-full">{editingId ? 'Update' : 'Add'} Expense</button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Expense List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-soft">No expenses found</div>
        ) : (
          filtered.map((expense, i) => (
            <motion.div
              key={expense._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-light">{expense.title}</p>
                <p className="text-sm text-soft mt-1">
                  <span className="capitalize">{expense.category === 'others' ? (expense.otherCategory || 'Other') : expense.category}</span>
                  {' · '}
                  {new Date(expense.date).toLocaleDateString()}
                  {expense.createdBy && ` · By ${expense.createdBy.name}`}
                </p>
                {expense.visibleTo && expense.visibleTo.length > 0 && (
                  <p className="text-xs text-soft mt-1">
                    Visible to: {expense.visibleTo.map(u => u.name || u).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-accent">{formatCurrency(expense.amount)}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(expense)} className="btn-primary text-sm">Edit</button>
                    <button onClick={() => handleDelete(expense._id)} className="btn-primary text-sm bg-red-600 hover:bg-red-700">Delete</button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
