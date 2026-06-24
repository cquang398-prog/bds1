import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">RealHome Business</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">Super Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-700">SA</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
