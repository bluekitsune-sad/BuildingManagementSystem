# 🏢 Building Management System — Project Plan

## 📌 Overview

A full-stack **Building Management Web Application** built using:

* **Frontend & Backend:** Next.js (App Router)
* **Database:** MongoDB
* **Architecture:** Role-Based Access Control (RBAC)
* **Goal:** Provide a centralized platform for building committees and residents to manage expenses, utilities, and shared data securely and efficiently.

---

## 🎯 Core Objectives

* Clean, scalable, and professional architecture
* High performance and reliability
* Strong implementation of **CIA Triad**:

  * **Confidentiality:** Role-based data visibility
  * **Integrity:** Controlled data modification & validation
  * **Availability:** Optimized performance & uptime

---

## 🧱 Tech Architecture

### 🔹 Frontend

* Next.js (App Router)
* Server Components + Client Components where needed
* Tailwind CSS (for styling)
* Framer Motion (light animations)

### 🔹 Backend

* Next.js API Routes / Server Actions
* JWT-based authentication
* Middleware for route protection

### 🔹 Database

* MongoDB (with Mongoose or Prisma)

---

## 📂 Folder Structure

```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /admin
    /resident
  /api
    /auth
    /users
    /uploads
    /expenses
    /permissions

/components
  /ui
  /layout
  /forms
  /animations

/lib
  /db
  /auth
  /utils
  /validators

/models
  User.js
  Upload.js
  Expense.js
  Permission.js

/middleware
  authMiddleware.js
  roleMiddleware.js

/public
  /uploads

/styles
  globals.css

/config
  constants.js
```

---

## 👥 User Roles

### 🔹 Admin

* Full access to all data and features
* Create, edit, delete users
* Assign permissions
* Manage uploads and expenses

### 🔹 Resident (Client)

* View-only access
* Can only see data explicitly permitted by admin

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Password hashing (bcrypt)
* Middleware-protected routes
* Role-based access control (RBAC)

---

## 📊 Features

### 🔹 User Management

* Create, edit, delete users
* Assign roles (Admin / Resident)
* Control visibility permissions per user

### 🔹 Data Management

* Upload:

  * Images
  * PDFs
  * Documents
* Label uploads with:

  * Uploaded by (user)
  * Category:

    * Utility Bill
    * Gas Payment
    * Maintenance
    * Others

### 🔹 Expense Tracking

* Add/edit/delete expenses
* Categorization
* Filtering by date/type/user

### 🔹 Visibility Control

* Select which users can view each upload
* Fine-grained access control

### 🔹 Dashboard

* Admin dashboard (full data overview)
* Resident dashboard (restricted data)

---

## ⚡ Performance Optimization

* Server-side rendering (SSR) where needed
* Static generation for stable pages
* Image optimization via Next.js
* Lazy loading components
* Efficient MongoDB queries (indexes)
* API response caching (where safe)

---

## 🛡️ Security (CIA Implementation)

### 🔐 Confidentiality

* Role-based access
* Data filtering at query level
* Secure JWT storage (HTTP-only cookies)

### 🧾 Integrity

* Input validation (Zod/Yup)
* Audit fields:

  * createdBy
  * updatedBy
* Restricted edit/delete permissions

### 🌐 Availability

* Optimized queries
* Error handling & fallback UI
* Scalable structure

---

## 🎨 UI / Theme

Use ONLY the following colors:

* `#2e071d` → Primary (dark background)
* `#213847` → Secondary (cards/nav)
* `#486e6b` → Accent (buttons/highlights)
* `#b38f86` → Soft highlight
* `#dbd0bf` → Text/light background

### ✨ Design Guidelines

* Minimal, modern UI
* Soft shadows and glass effects
* Smooth transitions (Framer Motion)
* Avoid heavy animations → keep lightweight

---

## 🎞️ Animations

* Page transitions (fade/slide)
* Button hover effects
* Modal animations
* Loading skeletons (not spinners-heavy)

---

## 📦 Data Models (Simplified)

### User

```
- name
- email
- password
- role (admin | resident)
- permissions []
- createdAt
```

### Upload

```
- title
- fileUrl
- type (image | pdf)
- category (utility, gas, maintenance, etc.)
- uploadedBy
- visibleTo []
- createdAt
```

### Expense

```
- title
- amount
- category
- createdBy
- date
```

---

## 🔄 Admin Capabilities (All via UI)

* Create, edit, and delete users
* Assign roles & permissions
* Upload/edit/delete files
* Manage expenses
* Control visibility of every data entry

---

## 🚀 Future Enhancements

* Notifications system
* Email alerts
* Payment integration
* Mobile responsiveness improvements
* Activity logs

---

## ✅ Summary

This system will be:

* Fully dynamic (no manual backend work needed)
* Secure with strict role-based control
* Optimized for performance and reliability
* Cleanly structured for scalability
* Visually appealing but lightweight

---
