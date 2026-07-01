import { Suspense } from 'react';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { CustomerFooter } from '@/components/customer/CustomerFooter';
import { CustomerCompanyProvider } from '@/components/customer/CustomerCompanyProvider';

function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <CustomerCompanyProvider>
      <CustomerHeader />
      <main className="flex-1">{children}</main>
      <CustomerFooter />
    </CustomerCompanyProvider>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={
        <div className="flex min-h-screen flex-col">
          <CustomerHeader />
          <main className="flex-1 flex items-center justify-center text-slate-400 text-sm">Đang tải...</main>
          <CustomerFooter />
        </div>
      }>
        <CustomerShell>{children}</CustomerShell>
      </Suspense>
    </div>
  );
}
