import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, customerName, customerPhone, property, viewingDate, viewingTime } = body;

    if (!companyId || !customerName || !customerPhone || !property || !viewingDate || !viewingTime) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // 1. Tạo lịch hẹn (appointments) bằng admin client (bypass RLS)
    const { data: appointment, error: aptError } = await supabaseAdmin
      .from('appointments')
      .insert({
        company_id: companyId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: null,
        room_id: property.id,
        room_title: property.title,
        date: viewingDate,
        time: viewingTime,
        area: property.area ?? null,
        status: 'pending',
        notes: `Yêu cầu xem qua website — ${property.address}`,
        assigned_to: null,
        assigned_to_name: null,
      })
      .select()
      .single();

    if (aptError) {
      console.error('Lỗi khi tạo lịch hẹn:', aptError);
      return NextResponse.json({ error: aptError.message }, { status: 400 });
    }

    // 2. Tạo lead mới bằng admin client (bypass RLS)
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        company_id: companyId,
        full_name: customerName,
        phone: customerPhone,
        email: null,
        source: 'website',
        status: 'new',
        interest: property.title,
        budget: 0,
        preferred_area: property.area ?? null,
        preferred_room_type: null,
        interested_area: property.area ?? null,
        assigned_to: null,
        notes: `Đặt lịch xem: ${property.title} — ${viewingDate} ${viewingTime}`,
        last_contacted_at: null,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Lỗi khi tạo lead:', leadError);
      // Không trả về lỗi chặn vì lịch hẹn đã được tạo thành công
    }

    // 3. Tạo lead activity nếu lead được tạo thành công
    if (lead) {
      const { error: actError } = await supabaseAdmin
        .from('lead_activities')
        .insert({
          lead_id: lead.id,
          company_id: companyId,
          type: 'note',
          content: `Khách đặt lịch xem qua website: ${property.title}`,
          old_status: null,
          new_status: null,
          created_by: null,
          created_by_name: 'Website',
        });

      if (actError) {
        console.error('Lỗi khi tạo lead activity:', actError);
      }
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi API đặt lịch hẹn:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
