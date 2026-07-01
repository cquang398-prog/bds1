import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Các role được toàn quyền, không cần kiểm tra role_permissions
const ADMIN_ROLES = ['super_admin', 'company_admin'];

/**
 * Hook kiểm tra quyền thao tác của user hiện tại.
 *
 * Phase 1 (hiện tại): super_admin và company_admin luôn trả về true.
 * Phase 2 (tương lai): map với bảng role_permissions theo module + action.
 *
 * @param module  - Tên module nghiệp vụ. Ví dụ: 'contracts', 'leads', 'employees'
 * @param action  - Hành động. Ví dụ: 'create', 'read', 'update', 'delete'
 * @returns boolean - true nếu được phép, false nếu không
 */
export function usePermission(module: string, action: string): boolean {
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkPermission() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (isMounted) setAllowed(false);
        return;
      }

      // Lấy role từ bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        if (isMounted) setAllowed(false);
        return;
      }

      // Phase 1: Admin roles luôn được phép
      if (ADMIN_ROLES.includes(profile.role)) {
        if (isMounted) setAllowed(true);
        return;
      }

      // TODO Phase 2: Kiểm tra bảng role_permissions theo module + action
      // const { data: perm } = await supabase
      //   .from('role_permissions')
      //   .select('id')
      //   .eq('role_id', profile.role_id)
      //   .eq('permission.module', module)
      //   .eq('permission.action', action)
      //   .single();
      // if (isMounted) setAllowed(!!perm);

      // Phase 1 fallback: role khác (sales_agent, ...) → chưa có quyền
      if (isMounted) setAllowed(false);
    }

    checkPermission();

    return () => {
      isMounted = false;
    };
  }, [module, action]);

  return allowed;
}
