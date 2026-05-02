import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  )
}
