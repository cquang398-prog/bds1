import { supabase } from '../client';
import type { DBBuilding } from '../types';

type BuildingInsert = Omit<DBBuilding, 'id' | 'created_at' | 'updated_at'>;
type BuildingUpdate = Partial<BuildingInsert>;

export async function getBuildings(companyId?: string): Promise<DBBuilding[]> {
  let q = supabase.from('buildings').select('*').order('created_at', { ascending: false });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DBBuilding[];
}

export async function getBuilding(id: string): Promise<DBBuilding | null> {
  const { data, error } = await supabase.from('buildings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown as DBBuilding | null;
}

export async function createBuilding(b: BuildingInsert): Promise<DBBuilding> {
  const { data, error } = await supabase.from('buildings').insert(b as any).select().single();
  if (error) throw error;
  return data as unknown as DBBuilding;
}

export async function updateBuilding(id: string, b: BuildingUpdate): Promise<DBBuilding> {
  const { data, error } = await supabase
    .from('buildings').update({ ...(b as any), updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as DBBuilding;
}

export async function deleteBuilding(id: string) {
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  if (error) throw error;
}
