import { useState, useEffect, useCallback } from 'react';
import { getCompanies, createCompany, updateCompany, deleteCompany, getCompanyStats, type CompanyInsert, type CompanyUpdate } from '@/lib/supabase/repositories/companies';
import type { DBCompany } from '@/lib/supabase/types';

export function useCompanies() {
  const [companies, setCompanies] = useState<DBCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanies();
      setCompanies(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (company: CompanyInsert) => {
    try {
      const data = await createCompany(company);
      setCompanies((prev) => [data, ...prev]);
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  };

  const update = async (id: string, patch: CompanyUpdate) => {
    try {
      const data = await updateCompany(id, patch);
      setCompanies((prev) => prev.map((c) => c.id === id ? data : c));
      return data;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return { companies, loading, error, refetch: fetch, add, update, remove };
}

export function useCompanyStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getCompanyStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCompanyStats().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
