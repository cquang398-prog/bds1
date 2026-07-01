import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateOnboardingToken } from '@/lib/auth/onboarding-token';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, domain, plan, owner_name, owner_email, phone, address, status: _ignoredStatus } = body;

    if (!name || !owner_name || !owner_email) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (name, owner_name, owner_email)' }, { status: 400 });
    }

    // 1. Tạo tài khoản trong Supabase Auth (Chưa kích hoạt password thực tế)
    const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: owner_name,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Tạo bản ghi Company với trạng thái ban đầu là 'pending'
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name,
        domain: domain || null,
        plan: plan || 'starter',
        status: 'pending', // Hardcode trạng thái 'pending' theo đúng yêu cầu nghiệp vụ
        owner_name,
        owner_email,
        phone: phone || null,
        address: address || null,
        total_users: 1,
        total_properties: 0,
      } as any)
      .select()
      .single();

    if (companyError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: companyError.message }, { status: 400 });
    }

    // 3. Cập nhật profile liên kết với company nhưng ở trạng thái inactive
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        company_id: companyData.id,
        role: 'company_admin',
        is_active: false, // Inactive cho đến khi hoàn tất onboarding
      })
      .eq('id', userId);

    if (profileError) {
      await supabaseAdmin.from('companies').delete().eq('id', companyData.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 4. Tạo onboarding token (Hiệu lực 48 giờ)
    const tokenPayload = generateOnboardingToken(48);

    const { error: inviteError } = await supabaseAdmin
      .from('tenant_invitations')
      .insert({
        email: owner_email,
        company_id: companyData.id,
        profile_id: userId,
        token_hash: tokenPayload.tokenHash,
        expires_at: tokenPayload.expiresAt.toISOString(),
      });

    if (inviteError) {
      await supabaseAdmin.from('companies').delete().eq('id', companyData.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    // 5. Gửi email mời onboarding qua Resend
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteLink = `${siteUrl}/onboarding?token=${tokenPayload.rawToken}`;

    let emailSent = false;
    let emailError: string | null = null;

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: sendError } = await resend.emails.send({
          from: 'RealHome <onboarding@resend.dev>',
          to: owner_email,
          subject: 'Lời mời kích hoạt tài khoản quản trị RealHome Business',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; margin-bottom: 20px; text-align: center;">Chào mừng bạn đến với RealHome Business</h2>
              <p>Xin chào <strong>${owner_name}</strong>,</p>
              <p>Bạn đã được mời làm Quản trị viên hệ thống cho doanh nghiệp <strong>${name}</strong> trên nền tảng RealHome Business.</p>
              <p>Vui lòng click vào nút bên dưới để thiết lập mật khẩu và hoàn tất việc kích hoạt tài khoản quản trị của bạn. Đường liên kết này có hiệu lực trong vòng 48 giờ.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Kích hoạt tài khoản</a>
              </div>
              <p style="color: #64748b; font-size: 13px;">Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
              <p style="color: #4f46e5; font-size: 13px; word-break: break-all;">${inviteLink}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
          `,
        });

        if (sendError) {
          emailError = sendError.message;
        } else {
          emailSent = true;
        }
      } catch (err: any) {
        emailError = err.message || 'Lỗi gửi email không xác định';
      }
    } else {
      emailError = 'Chưa cấu hình RESEND_API_KEY trong biến môi trường';
    }

    return NextResponse.json({
      success: true,
      company: companyData,
      inviteLink,
      expiresAt: tokenPayload.expiresAt,
      emailSent,
      emailError,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
