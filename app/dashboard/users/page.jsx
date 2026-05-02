"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [permissionModal, setPermissionModal] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/uploads").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([usersData, uploadsData, userData]) => {
        setUsers(usersData);
        setAllUsers(usersData);
        setUser(userData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await fetch("/api/users").then((r) => r.json());
      setUsers(updated);
      setAllUsers(updated);
      resetForm();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u._id !== id));
    setAllUsers(allUsers.filter((u) => u._id !== id));
  }

  function resetForm() {
    setForm({ name: "", email: "", password: "", role: "resident" });
    setEditingId(null);
    setShowForm(false);
  }

  function openPermissions(user) {
    setPermissionModal(user);
    setSelectedPermissions(user.permissions || []);
  }

  async function savePermissions() {
    await fetch(`/api/users/${permissionModal._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: selectedPermissions }),
    });
    const updated = await fetch("/api/users").then((r) => r.json());
    setUsers(updated);
    setAllUsers(updated);
    setPermissionModal(null);
  }

  function togglePermission(uploadId) {
    setSelectedPermissions((prev) =>
      prev.includes(uploadId)
        ? prev.filter((id) => id !== uploadId)
        : [...prev, uploadId],
    );
  }

  if (loading) return <div className="text-soft p-8">Loading users...</div>;

  const isAdmin = user?.role === "admin";
  if (!isAdmin) return <div className="text-soft p-8">Access denied</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light">User Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="card p-6 mb-8 space-y-4 overflow-hidden"
          >
            <h2 className="text-xl font-semibold text-light">
              {editingId ? "Edit User" : "Add User"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Name"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder={
                  editingId
                    ? "New password (leave blank to keep current)"
                    : "Password"
                }
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
              />
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update" : "Create"} User
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* User List */}
      <div className="space-y-3">
        {users.map((u, i) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-light font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-light">{u.name}</p>
                <p className="text-sm text-soft">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  u.role === "admin"
                    ? "bg-accent/30 text-accent"
                    : "bg-secondary text-soft"
                }`}
              >
                {u.role}
              </span>
              <button
                onClick={() => openPermissions(u)}
                className="btn-primary text-sm"
              >
                Permissions ({u.permissions?.length || 0})
              </button>
              <button
                onClick={() => {
                  setForm({
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    password: "",
                  });
                  setEditingId(u._id);
                  setShowForm(true);
                }}
                className="btn-primary text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(u._id)}
                className="btn-primary text-sm bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Permission Modal */}
      <AnimatePresence>
        {permissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPermissionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-light mb-2">
                Permissions for {permissionModal.name}
              </h2>
              <p className="text-sm text-soft mb-4">
                Select uploads this user can view
              </p>

              <div className="space-y-2">
                {allUsers.length === 0 ? (
                  <p className="text-soft text-sm">No uploads available</p>
                ) : (
                  // Show uploads as permission items
                  <p className="text-soft text-sm">
                    User can view data based on their role
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={savePermissions}
                  className="btn-primary flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setPermissionModal(null)}
                  className="btn-primary bg-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
