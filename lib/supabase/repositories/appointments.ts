import { supabase } from '../client';
import type { DBAppointment } from '../types';

type AppointmentInsert = Omit<DBAppointment, 'id' | 'created_at' | 'updated_at'>;
type AppointmentUpdate = Partial<AppointmentInsert>;

export async function getAppointments(companyId?: string): Promise<DBAppointment[]> {
  let q = supabase.from('appointments').select('*').order('date', { ascending: false });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DBAppointment[];
}

export async function createAppointment(a: AppointmentInsert): Promise<DBAppointment> {
  const { data, error } = await supabase.from('appointments').insert(a as any).select().single();
  if (error) throw error;
  return data as unknown as DBAppointment;
}

export async function updateAppointment(id: string, a: AppointmentUpdate): Promise<DBAppointment> {
  const { data, error } = await supabase
    .from('appointments').update({ ...(a as any), updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as DBAppointment;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}
