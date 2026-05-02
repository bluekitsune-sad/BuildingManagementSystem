"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoFolderOutline, IoImageOutline, IoDocumentTextOutline, IoCloudUploadOutline } from "react-icons/io5";
import { required, maxLength, categoryWithOthers } from "@/lib/validators/helpers";

const VALID_FILE_TYPES = [".jpg", ".jpeg", ".png", ".pdf"];
const CATEGORIES = [
  { value: "utility", label: "Utility Bill" },
  { value: "gas", label: "Gas Payment" },
  { value: "maintenance", label: "Maintenance" },
  { value: "others", label: "Others" },
];

export default function UploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    category: "utility",
    otherCategory: "",
    visibleTo: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: "all", search: "" });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/uploads").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([uploadsData, usersData, userData]) => {
        if (userData.error) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUploads(Array.isArray(uploadsData) ? uploadsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setUser(userData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!VALID_FILE_TYPES.includes(ext)) {
      setFileError("Only JPG, PNG, and PDF files are allowed");
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size must be under 10MB");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }

    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setFileError("");

    const fieldErrors = {};
    required("Title", form.title, fieldErrors);
    maxLength("Title", form.title, 100, fieldErrors);
    if (form.category === "others") {
      required("Category name", form.otherCategory, fieldErrors);
      maxLength("Category name", form.otherCategory, 50, fieldErrors);
    }
    if (!editingId && !selectedFile) {
      setFileError("Please select a file to upload");
      return;
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading file...");

    try {
      let fileUrl = form.fileUrl;
      if (selectedFile) {
        const cloudResult = await uploadFile(selectedFile);
        fileUrl = cloudResult.url;
        if (cloudResult.publicId) {
          form.filePublicId = cloudResult.publicId;
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/uploads/${editingId}` : "/api/uploads";
      const body = {
        title: form.title,
        category: form.category,
        otherCategory: form.category === "others" ? form.otherCategory : undefined,
        fileUrl,
        visibleTo: form.visibleTo,
      };
      if (editingId) {
        body.filePublicId = form.filePublicId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFileError(data.error || "Failed to save");
        setUploading(false);
        return;
      }

      const updated = await fetch("/api/uploads").then((r) => r.json());
      setUploads(Array.isArray(updated) ? updated : []);
      resetForm();
    } catch (err) {
      setFileError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this upload?")) return;
    const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUploads(uploads.filter((u) => u._id !== id));
    }
  }

  function handleEdit(upload) {
    setForm({
      title: upload.title,
      category: upload.category,
      otherCategory: upload.otherCategory || "",
      visibleTo: upload.visibleTo
        ? upload.visibleTo.map((v) => v._id || v)
        : [],
      fileUrl: upload.fileUrl,
      filePublicId: upload.filePublicId,
    });
    setEditingId(upload._id);
    setSelectedFile(null);
    setShowForm(true);
  }

  function resetForm() {
    setForm({ title: "", category: "utility", otherCategory: "", visibleTo: [] });
    setEditingId(null);
    setShowForm(false);
    setSelectedFile(null);
    setFileError("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    const displayCategory = upload.category === "others" ? (upload.otherCategory || "Others") : upload.category;
    const matchCat =
      filter.category === "all" ||
      upload.category === filter.category ||
      displayCategory.toLowerCase().includes(filter.category.toLowerCase());
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
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
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

            {/* File Upload */}
            {!editingId && (
              <div>
                <label className="block text-soft text-sm mb-2">File (JPG, PNG, PDF)</label>
                <div
                  className="border-2 border-dashed border-secondary rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IoCloudUploadOutline className="w-8 h-8 text-soft mx-auto mb-2" />
                  {selectedFile ? (
                    <p className="text-light text-sm">{selectedFile.name}</p>
                  ) : (
                    <p className="text-soft text-sm">Click to select file</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {fileError && <p className="text-red-400 text-sm mt-1">{fileError}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  placeholder="Title"
                  className={`input-field w-full ${errors.title ? "border-red-400" : ""}`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <select
                  className="input-field w-full"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {form.category === "others" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    placeholder="Enter category name"
                    className={`input-field w-full ${errors.otherCategory ? "border-red-400" : ""}`}
                    value={form.otherCategory}
                    onChange={(e) => setForm({ ...form, otherCategory: e.target.value })}
                  />
                  {errors.otherCategory && <p className="text-red-400 text-xs mt-1">{errors.otherCategory}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visibility Control */}
            <div>
              <label className="block text-soft text-sm mb-2">
                Visible To Residents (empty = all residents)
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

            <button type="submit" className="btn-primary w-full" disabled={uploading}>
              {uploading ? "Uploading..." : editingId ? "Update" : "Upload"} File
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
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      upload.type === "image"
                        ? "bg-green-900/50 text-green-300"
                        : "bg-red-900/50 text-red-300"
                    }`}
                  >
                    {upload.type === "image" ? <IoImageOutline className="w-3 h-3" /> : <IoDocumentTextOutline className="w-3 h-3" />}
                    {upload.type.toUpperCase()}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2">
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
                  Category: {upload.category === "others" ? (upload.otherCategory || "Others") : upload.category}
                </p>
                {upload.uploadedBy && (
                  <p className="text-xs text-soft">
                    By: {upload.uploadedBy.name}
                  </p>
                )}
                {isAdmin && upload.visibleTo && (
                  <p className="text-xs text-soft mt-2">
                    Visible to: {upload.visibleTo.length > 0 ? `${upload.visibleTo.length} resident(s)` : "All residents"}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <a
                  href={upload.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Open File
                </a>
                <p className="text-xs text-soft">
                  {new Date(upload.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
