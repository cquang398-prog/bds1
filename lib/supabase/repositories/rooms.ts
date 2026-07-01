import { supabase } from '../client';
import type { DBRoom } from '../types';

type RoomInsert = Omit<DBRoom, 'id' | 'created_at' | 'updated_at'>;
type RoomUpdate = Partial<RoomInsert>;

export type RoomWithBuilding = DBRoom & { buildings: { name: string; area: string; address: string | null } | null };

export async function getRooms(companyId?: string): Promise<RoomWithBuilding[]> {
  let q = supabase
    .from('rooms')
    .select('*, buildings(name, area, address)')
    .order('created_at', { ascending: false });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as RoomWithBuilding[];
}

export async function getRoomsByBuilding(buildingId: string, companyId?: string): Promise<DBRoom[]> {
  let q = supabase
    .from('rooms')
    .select('*')
    .eq('building_id', buildingId)
    .order('floor', { ascending: true })
    .order('code', { ascending: true });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DBRoom[];
}

export async function getRoom(id: string): Promise<DBRoom | null> {
  const { data, error } = await supabase.from('rooms').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown as DBRoom | null;
}

export async function createRoom(r: RoomInsert): Promise<DBRoom> {
  const { data, error } = await supabase.from('rooms').insert(r as any).select().single();
  if (error) throw error;
  return data as unknown as DBRoom;
}

export async function updateRoom(id: string, r: RoomUpdate): Promise<DBRoom> {
  const { data, error } = await supabase
    .from('rooms').update({ ...(r as any), updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as DBRoom;
}

export async function deleteRoom(id: string) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
}

