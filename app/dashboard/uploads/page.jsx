"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    fileUrl: "",
    type: "pdf",
    category: "utility",
    visibleTo: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: "all", search: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/uploads").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([uploadsData, usersData, userData]) => {
        setUploads(uploadsData);
        setUsers(usersData);
        setUser(userData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/uploads/${editingId}` : "/api/uploads";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await fetch("/api/uploads").then((r) => r.json());
      setUploads(updated);
      resetForm();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this upload?")) return;
    await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    setUploads(uploads.filter((u) => u._id !== id));
  }

  function handleEdit(upload) {
    setForm({
      title: upload.title,
      fileUrl: upload.fileUrl,
      type: upload.type,
      category: upload.category,
      visibleTo: upload.visibleTo
        ? upload.visibleTo.map((v) => v._id || v)
        : [],
    });
    setEditingId(upload._id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({
      title: "",
      fileUrl: "",
      type: "pdf",
      category: "utility",
      visibleTo: [],
    });
    setEditingId(null);
    setShowForm(false);
  }

  function toggleUser(userId) {
    setForm((prev) => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(userId)
        ? prev.visibleTo.filter((id) => id !== userId)
        : [...prev.visibleTo, userId],
    }));
  }

  const filtered = uploads.filter((upload) => {
    const matchCat =
      filter.category === "all" || upload.category === filter.category;
    const matchSearch = upload.title
      .toLowerCase()
      .includes(filter.search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <div className="text-soft p-8">Loading uploads...</div>;

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light">Uploads</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "+ Add Upload"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search uploads..."
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
          <option value="utility">Utility Bill</option>
          <option value="gas">Gas Payment</option>
          <option value="maintenance">Maintenance</option>
          <option value="others">Others</option>
        </select>
        <span className="text-sm text-soft ml-auto">
          {filtered.length} files
        </span>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="card p-6 mb-8 space-y-4 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-light">
              {editingId ? "Edit Upload" : "Add Upload"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Title"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                placeholder="File URL (e.g. /uploads/bill.pdf)"
                className="input-field"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                required
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
            </div>

            {/* Visibility Control */}
            <div>
              <label className="block text-soft text-sm mb-2">
                Visible To Residents
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {users
                  .filter((u) => u.role === "resident")
                  .map((resident) => (
                    <label
                      key={resident._id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.visibleTo.includes(resident._id)}
                        onChange={() => toggleUser(resident._id)}
                        className="accent-accent"
                      />
                      <span className="text-sm text-light">
                        {resident.name}
                      </span>
                    </label>
                  ))}
              </div>
              {users.filter((u) => u.role === "resident").length === 0 && (
                <p className="text-sm text-soft">No residents available</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update" : "Upload"} File
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-soft">
            No uploads found
          </div>
        ) : (
          filtered.map((upload, i) => (
            <motion.div
              key={upload._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="card p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      upload.type === "image"
                        ? "bg-green-900/50 text-green-300"
                        : upload.type === "pdf"
                          ? "bg-red-900/50 text-red-300"
                          : "bg-blue-900/50 text-blue-300"
                    }`}
                  >
                    {upload.type.toUpperCase()}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(upload)}
                        className="text-sm text-soft hover:text-light"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(upload._id)}
                        className="text-sm text-soft hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-light mb-2">
                  {upload.title}
                </h3>
                <p className="text-sm text-soft mb-1 capitalize">
                  Category: {upload.category}
                </p>
                {upload.uploadedBy && (
                  <p className="text-xs text-soft">
                    By: {upload.uploadedBy.name}
                  </p>
                )}
                {isAdmin && upload.visibleTo && (
                  <p className="text-xs text-soft mt-2">
                    Visible to: {upload.visibleTo.length} resident(s)
                  </p>
                )}
              </div>
              <p className="text-xs text-soft mt-3">
                {new Date(upload.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
