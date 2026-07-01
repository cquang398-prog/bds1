import { supabase } from '../client';
import { mapRoomToListing } from '@/lib/customer/listing-mapper';
import type { CustomerListing, PublicCompany } from '@/lib/customer/types';

const companySelect = 'id, name, domain, phone, address';

export async function getCompanyByDomain(domain: string): Promise<PublicCompany | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(companySelect)
    .eq('domain', domain)
    .in('status', ['active', 'trial'])
    .maybeSingle();

  if (error) throw error;
  return data as PublicCompany | null;
}

export async function getDefaultCompany(): Promise<PublicCompany | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(companySelect)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PublicCompany | null;
}

export async function resolveCompany(domainParam?: string | null): Promise<PublicCompany | null> {
  const domain = domainParam?.trim();
  if (domain) {
    const company = await getCompanyByDomain(domain);
    if (company) return company;
  }
  return getDefaultCompany();
}

export async function getPublicListings(companyId: string | string[]): Promise<CustomerListing[]> {
  let query = supabase
    .from('rooms')
    .select('*, buildings(id, name, area, address, year_built, image_url, description)');

  if (Array.isArray(companyId)) {
    query = query.in('company_id', companyId);
  } else if (companyId.includes(',')) {
    query = query.in('company_id', companyId.split(',').map((id) => id.trim()));
  } else {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => mapRoomToListing(row as Parameters<typeof mapRoomToListing>[0]))
    .filter((item): item is CustomerListing => item !== null);
}

export async function getPublicListing(id: string, companyId?: string | string[] | null): Promise<CustomerListing | null> {
  let query = supabase
    .from('rooms')
    .select('*, buildings(id, name, area, address, year_built, image_url, description)')
    .eq('id', id);

  if (companyId) {
    if (Array.isArray(companyId)) {
      query = query.in('company_id', companyId);
    } else if (companyId.includes(',')) {
      query = query.in('company_id', companyId.split(',').map((id) => id.trim()));
    } else {
      query = query.eq('company_id', companyId);
    }
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return mapRoomToListing(data as Parameters<typeof mapRoomToListing>[0]);
}

export async function getPublicListingsByIds(ids: string[], companyId?: string | string[] | null): Promise<CustomerListing[]> {
  if (ids.length === 0) return [];

  let query = supabase
    .from('rooms')
    .select('*, buildings(id, name, area, address, year_built, image_url, description)')
    .in('id', ids);

  if (companyId) {
    if (Array.isArray(companyId)) {
      query = query.in('company_id', companyId);
    } else if (companyId.includes(',')) {
      query = query.in('company_id', companyId.split(',').map((id) => id.trim()));
    } else {
      query = query.eq('company_id', companyId);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row) => mapRoomToListing(row as Parameters<typeof mapRoomToListing>[0]))
    .filter((item): item is CustomerListing => item !== null);
}
