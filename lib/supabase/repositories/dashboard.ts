import { supabase } from '../client';

export async function getDashboardStats(companyId: string) {
  const [buildings, rooms, leads, appointments, consultations, notifications] = await Promise.all([
    supabase.from('buildings').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('rooms').select('id, status', { count: 'exact' }).eq('company_id', companyId),
    supabase.from('leads').select('id, status', { count: 'exact' }).eq('company_id', companyId),
    supabase.from('appointments').select('id, status, customer_name, room_title, date, time').eq('company_id', companyId).order('date', { ascending: false }).limit(5),
    supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'new'),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_read', false),
  ]);

  const roomRows = (rooms.data ?? []) as { id: string; status: string }[];
  const leadRows = (leads.data ?? []) as { id: string; status: string }[];
  const recentAppointments = (appointments.data ?? []) as any[];

  return {
    totalBuildings: buildings.count ?? 0,
    totalRooms: roomRows.length,
    availableRooms: roomRows.filter((r) => r.status === 'available').length,
    rentedRooms: roomRows.filter((r) => r.status === 'rented').length,
    totalLeads: leadRows.length,
    newLeads: leadRows.filter((l) => ['new', 'contacted', 'consulting'].includes(l.status)).length,
    newConsultations: consultations.count ?? 0,
    unreadNotifications: notifications.count ?? 0,
    recentAppointments,
    recentLeads: leadRows.slice(0, 5),
  };
}
