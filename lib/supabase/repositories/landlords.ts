import { supabase } from '../client';
import type { DBLandlord } from '../types';

type LandlordInsert = Omit<DBLandlord, 'id' | 'created_at' | 'updated_at'>;
type LandlordUpdate = Partial<LandlordInsert>;

export async function getLandlords(companyId?: string): Promise<DBLandlord[]> {
  let q = supabase.from('landlords').select('*').order('created_at', { ascending: false });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DBLandlord[];
}

export async function createLandlord(l: LandlordInsert): Promise<DBLandlord> {
  const { data, error } = await supabase.from('landlords').insert(l as any).select().single();
  if (error) throw error;
  return data as unknown as DBLandlord;
}

export async function updateLandlord(id: string, l: LandlordUpdate): Promise<DBLandlord> {
  const { data, error } = await supabase
    .from('landlords').update({ ...(l as any), updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as DBLandlord;
}

export async function deleteLandlord(id: string) {
  const { error } = await supabase.from('landlords').delete().eq('id', id);
  if (error) throw error;
}
