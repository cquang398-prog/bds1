import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware-client';

// ─── Route config ─────────────────────────────────────────────────────────────
const SUPER_ADMIN_PREFIXES = ['/super-admin'];
const COMPANY_PREFIXES = ['/admin'];
const PROTECTED_PREFIXES = ['/admin', '/super-admin'];

// Routes bỏ qua hoàn toàn (không check auth)
const SKIP_PREFIXES = ['/api', '/_next', '/favicon', '/customer', '/onboarding'];

// ─── Middleware ────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // 1. Bỏ qua các route không cần auth (API, static, public pages)
  const shouldSkip = SKIP_PREFIXES.some((p) => pathname.startsWith(p));
  if (shouldSkip) {
    return injectHeaders(NextResponse.next({ request }), hostname);
  }

  // 2. Khởi tạo Supabase SSR client — đọc/refresh session từ Cookie
  const { supabase, response } = createMiddlewareClient(request);

  // QUAN TRỌNG: Luôn dùng getUser() thay vì getSession() ở server-side
  // getUser() xác thực token với Supabase Auth server, chống token giả mạo
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isLoginPage = pathname === '/login';

  // 3. Đang ở trang login mà đã có session → redirect đến dashboard tương ứng
  if (isLoginPage && user) {
    const role = extractRole(user);
    const destination = role === 'super_admin' ? '/super-admin' : '/admin';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 4. Đang ở route protected mà chưa có session → redirect về /login
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Có session — kiểm tra phân quyền role giữa các vùng protected
  if (isProtected && user) {
    const role = extractRole(user);

    if (role) {
      const isSuperAdminRoute = SUPER_ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
      const isCompanyRoute = COMPANY_PREFIXES.some((p) => pathname.startsWith(p));

      if (isSuperAdminRoute && role !== 'super_admin') {
        // Không phải super_admin → chuyển sang admin portal
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      if (isCompanyRoute && role === 'super_admin') {
        // Super admin cố vào /admin → chuyển sang /super-admin
        return NextResponse.redirect(new URL('/super-admin', request.url));
      }
    }
    // Nếu không có role trong JWT metadata → để client-side AuthGuard xử lý thêm
  }

  // 6. Inject headers tiện ích và trả về response đã mang cookie refresh mới (nếu có)
  return injectHeaders(response, hostname);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Đọc role từ JWT metadata của Supabase user.
 * Supabase lưu custom claims trong app_metadata hoặc user_metadata.
 */
function extractRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }): string | null {
  return (
    (user.app_metadata?.role as string | undefined) ||
    (user.user_metadata?.role as string | undefined) ||
    null
  );
}

/**
 * Inject headers hỗ trợ cho Server Components và layout:
 * - x-company-domain: subdomain của công ty (multi-tenant routing)
 * - x-forwarded-host: hostname gốc
 */
function injectHeaders(response: NextResponse, hostname: string): NextResponse {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
  let companyDomain: string | null = null;

  if (
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    !hostname.startsWith('192.168.')
  ) {
    const withoutPort = hostname.split(':')[0];
    if (withoutPort.endsWith(`.${rootDomain}`)) {
      companyDomain = withoutPort.slice(0, -(rootDomain.length + 1));
    } else if (withoutPort !== rootDomain) {
      companyDomain = withoutPort;
    }
  }

  if (companyDomain) {
    response.headers.set('x-company-domain', companyDomain);
  }
  response.headers.set('x-forwarded-host', hostname);

  return response;
}

// ─── Matcher config ────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Áp dụng middleware cho tất cả routes TRỪ:
     * - _next/static, _next/image (static assets)
     * - favicon.ico
     * - Các file ảnh tĩnh
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
