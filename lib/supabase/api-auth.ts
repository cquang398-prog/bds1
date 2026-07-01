import { NextResponse } from 'next/server';
import { supabaseAdmin } from './admin';
import type { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Profile['role'];

export type ApiAuthContext = {
  userId: string;
  profile: Profile;
};

export async function requireApiAuth(
  request: Request,
  allowedRoles: UserRole[]
): Promise<ApiAuthContext | NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!profile.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!allowedRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { userId: user.id, profile: profile as Profile };
}

export function isApiError(result: ApiAuthContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
