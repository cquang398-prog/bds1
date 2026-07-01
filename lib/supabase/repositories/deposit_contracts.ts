import { supabase } from '../client';
import type { DBDepositContract, Database } from '../types';

export type DepositContractInsert = Database['public']['Tables']['deposit_contracts']['Insert'];
export type DepositContractUpdate = Database['public']['Tables']['deposit_contracts']['Update'];

export type DepositContractWithRoom = DBDepositContract & {
  rooms: {
    code: string;
    price: number;
    buildings: {
      name: string;
      address: string | null;
      area: string;
    } | null;
  } | null;
};

/**
 * Lấy danh sách hợp đồng đặt cọc theo company_id.
 */
export async function getDepositContracts(companyId?: string): Promise<DepositContractWithRoom[]> {
  let q = supabase
    .from('deposit_contracts')
    .select('*, rooms(code, price, buildings(name, address, area))')
    .order('created_at', { ascending: false });

  if (companyId) {
    q = q.eq('company_id', companyId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DepositContractWithRoom[];
}

/**
 * Lấy thông tin chi tiết một hợp đồng đặt cọc theo id.
 */
export async function getDepositContract(id: string): Promise<DepositContractWithRoom | null> {
  const { data, error } = await supabase
    .from('deposit_contracts')
    .select('*, rooms(code, price, buildings(name, address, area))')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as DepositContractWithRoom | null;
}

/**
 * Tạo mới hợp đồng đặt cọc.
 */
export async function createDepositContract(contract: DepositContractInsert): Promise<DBDepositContract> {
  const { data, error } = await supabase
    .from('deposit_contracts')
    .insert(contract as any)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as DBDepositContract;
}

/**
 * Cập nhật thông tin hợp đồng đặt cọc.
 */
export async function updateDepositContract(id: string, updates: DepositContractUpdate): Promise<DBDepositContract> {
  const { data, error } = await supabase
    .from('deposit_contracts')
    .update({ ...(updates as any), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as DBDepositContract;
}

/**
 * Xóa hợp đồng đặt cọc.
 */
export async function deleteDepositContract(id: string): Promise<void> {
  const { error } = await supabase
    .from('deposit_contracts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
