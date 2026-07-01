import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Supabase Browser Client — dùng cho Client Components.
 * Dùng createBrowserClient từ @supabase/ssr để session tự động được
 * lưu vào Cookie của trình duyệt thay vì localStorage.
 * Nhờ vậy Middleware (Edge Runtime) mới đọc được session qua createServerClient.
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
