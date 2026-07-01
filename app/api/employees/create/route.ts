import { NextResponse } from 'next/server';
import { requireApiAuth, isApiError } from '@/lib/supabase/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, ['company_admin', 'manager']);
    if (isApiError(auth)) return auth;

    const body = await request.json();
    const { company_id, name, email, phone, department, position, join_date, status } = body;

    if (!company_id || !email || !name) {
      return NextResponse.json({ error: 'Thiếu thông tin công ty hoặc email nhân sự' }, { status: 400 });
    }

    if (auth.profile.company_id !== company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'Sales@2026',
      email_confirm: true,
      user_metadata: {
        full_name: name,
        company_id,
        role: 'sales_agent',
      },
    });

    if (authError) {
      return NextResponse.json({ error: 'Lỗi tạo xác thực tài khoản: ' + authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: userId,
        company_id,
        name,
        email,
        phone,
        department,
        position,
        join_date: join_date ? new Date(join_date).toISOString() : null,
        status: status || 'active',
      });

    if (employeeError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Lỗi lưu bảng nhân sự: ' + employeeError.message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        company_id,
        role: 'sales_agent',
        is_active: true,
      })
      .eq('id', userId);

    if (profileError) {
      await supabaseAdmin.from('employees').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Lỗi đồng bộ phân quyền: ' + profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, employee_id: userId }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi hệ thống: ' + error.message }, { status: 500 });
  }
}
