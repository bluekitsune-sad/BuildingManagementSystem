"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginSchema } from "@/lib/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  function validateField(name, value) {
    const result = loginSchema.pick({ [name]: true }).safeParse({ [name]: value });
    if (!result.success) {
      return result.error.errors[0].message;
    }
    return "";
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, form[name]);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name] && fieldErrors[name]) {
      const err = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setTouched({ email: true, password: true });
      setSubmitError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setSubmitError(data.error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-light">Login</h2>
        <p className="text-soft text-sm mb-6">Building Management System</p>

        {submitError && (
          <p className="text-red-400 mb-4 text-sm bg-red-900/20 p-3 rounded">
            {submitError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-soft">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-field ${fieldErrors.email && touched.email ? "border-red-400" : ""}`}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {fieldErrors.email && touched.email && (
              <p className="text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-soft">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className={`input-field ${fieldErrors.password && touched.password ? "border-red-400" : ""}`}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
            />
            {fieldErrors.password && touched.password && (
              <p className="text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
