'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];
type UserRole = Profile['role'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data as Profile | null;
}

async function loadCompany(companyId: string): Promise<Company | null> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();
  return data as Company | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    company: null,
    role: null,
    loading: true,
  });

  const hydrateUser = useCallback(async (user: User | null) => {
    if (!user) {
      setState({ user: null, profile: null, company: null, role: null, loading: false });
      return;
    }

    const profile = await loadProfile(user.id);
    const company = profile?.company_id ? await loadCompany(profile.company_id) : null;

    setState({
      user,
      profile,
      company,
      role: profile?.role ?? null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateUser(session?.user ?? null);
    });

    // Listen for auth changes — use a flag to avoid acting on the initial
    // SIGNED_IN event that fires right after getSession() resolves.
    let initialized = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!initialized) { initialized = true; return; }
        hydrateUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [hydrateUser]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await loadProfile(session.user.id);
      const company = profile?.company_id ? await loadCompany(profile.company_id) : null;
      setState({ user: session.user, profile, company, role: profile?.role ?? null, loading: false });

      // Redirect based on role
      if (profile?.role === 'super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/admin');
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, company: null, role: null, loading: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
