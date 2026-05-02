'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function UploadsPage() {
  const [uploads, setUploads] = useState([])
  const [form, setForm] = useState({ title: '', fileUrl: '', type: 'pdf', category: 'utility', visibleTo: [] })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/uploads').then(res => res.json()).then(setUploads)
    fetch('/api/users').then(res => res.json()).then(setUsers)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await fetch('/api/uploads').then(r => r.json())
      setUploads(updated)
      setForm({ title: '', fileUrl: '', type: 'pdf', category: 'utility', visibleTo: [] })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-light">Uploads</h1>

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
          placeholder="File URL"
          className="input-field"
          value={form.fileUrl}
          onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
        />
        <select
          className="input-field"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="document">Document</option>
        </select>
        <select
          className="input-field"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="utility">Utility Bill</option>
          <option value="gas">Gas Payment</option>
          <option value="maintenance">Maintenance</option>
          <option value="others">Others</option>
        </select>
        <button type="submit" className="btn-primary w-full">Upload</button>
      </motion.form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uploads.map(upload => (
          <motion.div
            key={upload._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6"
          >
            <h3 className="font-bold text-light mb-2">{upload.title}</h3>
            <p className="text-sm text-soft mb-1">Type: {upload.type}</p>
            <p className="text-sm text-soft mb-1">Category: {upload.category}</p>
            <p className="text-sm text-soft">By: {upload.uploadedBy?.name || 'Unknown'}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
