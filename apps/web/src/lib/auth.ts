'use client';

import { getSupabase } from './supabase';

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  // Clear stored tokens
  document.cookie = 'sb-access-token=; path=/; max-age=0';
  document.cookie = 'supabase-auth-token=; path=/; max-age=0';
  localStorage.removeItem('sb-access-token');
  window.location.href = '/dashboard/login';
}

export function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('sb-access-token');
    if (!token) return null;
    // JWT payload is base64 encoded second segment
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return (payload as { email?: string }).email ?? null;
  } catch {
    return null;
  }
}
