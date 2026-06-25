import { supabase } from '../client';
import type { DBEmployee } from '../types';

type EmployeeInsert = Omit<DBEmployee, 'id' | 'created_at' | 'updated_at'>;
type EmployeeUpdate = Partial<EmployeeInsert>;

export async function getEmployees(companyId?: string): Promise<DBEmployee[]> {
  let q = supabase.from('employees').select('*').order('created_at', { ascending: false });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DBEmployee[];
}

export async function createEmployee(e: EmployeeInsert): Promise<DBEmployee> {
  const { data, error } = await supabase.from('employees').insert(e as any).select().single();
  if (error) throw error;
  return data as unknown as DBEmployee;
}

export async function updateEmployee(id: string, e: EmployeeUpdate): Promise<DBEmployee> {
  const { data, error } = await supabase
    .from('employees').update({ ...(e as any), updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as DBEmployee;
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}
