import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

/**
 * Tạo Supabase Server Client dùng trong middleware (Edge Runtime).
 * Sử dụng @supabase/ssr để đọc/ghi session qua Cookie chuẩn Next.js App Router.
 *
 * @returns { supabase, response } - Luôn dùng `response` được trả về để
 *   Next.js ghi lại cookie refresh token mới khi session được gia hạn.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Ghi cookie vào request trước để server components đọc được
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Tạo lại response với request đã có cookie mới
          response = NextResponse.next({ request });
          // Ghi cookie vào response để trình duyệt lưu lại
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
