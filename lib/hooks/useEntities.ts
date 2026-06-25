import { useState, useEffect, useCallback } from 'react';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from '@/lib/supabase/repositories/buildings';
import { getLandlords, createLandlord, updateLandlord, deleteLandlord } from '@/lib/supabase/repositories/landlords';
import { getRooms, createRoom, updateRoom, deleteRoom, type RoomWithBuilding } from '@/lib/supabase/repositories/rooms';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/lib/supabase/repositories/appointments';
import { getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate } from '@/lib/supabase/repositories/contracts';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/lib/supabase/repositories/employees';
import type { DBBuilding, DBLandlord, DBRoom, DBAppointment, DBContractTemplate, DBEmployee } from '@/lib/supabase/types';

function makeHook<T>(
  fetcher: (companyId?: string) => Promise<T[]>,
  creator: (item: any) => Promise<T>,
  updater: (id: string, item: any) => Promise<T>,
  remover: (id: string) => Promise<void>
) {
  return function useEntity(companyId?: string) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        setItems(await fetcher(companyId));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, [companyId]);

    useEffect(() => { fetch(); }, [fetch]);

    const add = async (item: any): Promise<T | null> => {
      try {
        const created = await creator(item);
        setItems((prev) => [created, ...prev]);
        return created;
      } catch (e: any) { setError(e.message); return null; }
    };

    const update = async (id: string, patch: any): Promise<T | null> => {
      try {
        const updated = await updater(id, patch);
        setItems((prev) => prev.map((i: any) => i.id === id ? updated : i));
        return updated;
      } catch (e: any) { setError(e.message); return null; }
    };

    const remove = async (id: string) => {
      try {
        await remover(id);
        setItems((prev) => (prev as any[]).filter((i) => i.id !== id));
      } catch (e: any) { setError(e.message); }
    };

    return { items, loading, error, refetch: fetch, add, update, remove };
  };
}

export const useBuildings = makeHook<DBBuilding>(getBuildings, createBuilding, updateBuilding, deleteBuilding);
export const useLandlords = makeHook<DBLandlord>(getLandlords, createLandlord, updateLandlord, deleteLandlord);
export const useAppointments = makeHook<DBAppointment>(getAppointments, createAppointment, updateAppointment, deleteAppointment);
export const useContractTemplates = makeHook<DBContractTemplate>(getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate);
export const useEmployees = makeHook<DBEmployee>(getEmployees, createEmployee, updateEmployee, deleteEmployee);

export function useRooms(companyId?: string) {
  const [items, setItems] = useState<RoomWithBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getRooms(companyId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (item: any) => {
    try {
      const created = await createRoom(item);
      await fetch();
      return created;
    } catch (e: any) { setError(e.message); return null; }
  };

  const update = async (id: string, patch: any) => {
    try {
      const updated = await updateRoom(id, patch);
      await fetch();
      return updated;
    } catch (e: any) { setError(e.message); return null; }
  };

  const remove = async (id: string) => {
    try {
      await deleteRoom(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  return { items, loading, error, refetch: fetch, add, update, remove };
}
