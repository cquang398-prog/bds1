'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

type AllowedRole = 'super_admin' | 'company_admin' | 'manager' | 'sales_agent';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (role && !allowedRoles.includes(role as AllowedRole)) {
      // Wrong portal — redirect to the correct one
      router.replace(role === 'super_admin' ? '/super-admin' : '/admin');
    }
  }, [loading, user, role, router, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-sm">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children until user is confirmed and role is valid
  if (!user || (role && !allowedRoles.includes(role as AllowedRole))) {
    return null;
  }

  return <>{children}</>;
}
