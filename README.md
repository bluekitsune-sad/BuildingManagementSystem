# 🏢 Building Management System

A full-stack Building Management Web Application with role-based access control.

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB URI and JWT secret.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 🎨 Color Scheme

- Primary: `#2e071d` (dark background)
- Secondary: `#213847` (cards/nav)
- Accent: `#486e6b` (buttons/highlights)
- Soft: `#b38f86` (soft highlight)
- Light: `#dbd0bf` (text/light background)

## 👥 User Roles

### Admin
- Full access to all data and features
- Create, edit, delete users
- Assign permissions
- Manage uploads and expenses

### Resident
- View-only access
- Can only see data explicitly permitted by admin

## 📊 Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- User management
- File uploads (images, PDFs, documents)
- Expense tracking with categorization
- Responsive dashboard
- Framer Motion animations
