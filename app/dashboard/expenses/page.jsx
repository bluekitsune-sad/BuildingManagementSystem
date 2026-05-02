"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "utility",
    date: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: "all", search: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([expensesData, userData]) => {
      setExpenses(expensesData);
      setUser(userData);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const updated = await fetch("/api/expenses").then((r) => r.json());
      setExpenses(updated);
      resetForm();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setExpenses(expenses.filter((e) => e._id !== id));
  }

  function handleEdit(expense) {
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
    });
    setEditingId(expense._id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({ title: "", amount: "", category: "utility", date: "" });
    setEditingId(null);
    setShowForm(false);
  }

  const filtered = expenses.filter((exp) => {
    const matchCat =
      filter.category === "all" || exp.category === filter.category;
    const matchSearch = exp.title
      .toLowerCase()
      .includes(filter.search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalAmount = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) return <div className="text-soft p-8">Loading expenses...</div>;

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light">Expenses</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancel" : "+ Add Expense"}
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
          Total: ${totalAmount.toFixed(2)} ({filtered.length})
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
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                placeholder="Title"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                className="input-field"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="utility">Utility</option>
                <option value="gas">Gas</option>
                <option value="maintenance">Maintenance</option>
                <option value="others">Others</option>
              </select>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingId ? "Update" : "Add"} Expense
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-primary bg-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Expense List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-soft">
            No expenses found
          </div>
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
                  <span className="capitalize">{expense.category}</span>
                  {" · "}
                  {new Date(expense.date).toLocaleDateString()}
                  {expense.createdBy && ` · By ${expense.createdBy.name}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-accent">
                  ${expense.amount.toLocaleString()}
                </span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="btn-primary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="btn-primary text-sm bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
