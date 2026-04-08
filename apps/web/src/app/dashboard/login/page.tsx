'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

const C = {
  green: '#1a7f4b',
  greenPale: '#e8f5ee',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray900: '#111827',
  red: '#ef4444',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  const supabase = getSupabase();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setError('Supabase not configured.'); return; }
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Store token in cookie so middleware can read it
    if (data.session?.access_token) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      localStorage.setItem('sb-access-token', data.session.access_token);
    }
    router.push(redirect);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setError('Supabase not configured.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirect}` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
          <h2 style={styles.title}>Check your email</h2>
          <p style={{ color: C.gray600, fontSize: '0.9rem', lineHeight: 1.6 }}>
            We sent a magic link to <strong>{email}</strong>.
            Click it to sign in to your PAR-Tee dashboard.
          </p>
          <button onClick={() => setMagicSent(false)} style={styles.linkBtn}>
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>⛳</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.green, margin: '0.25rem 0 0' }}>
            PAR-Tee
          </h1>
          <p style={{ color: C.gray500, fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Course Dashboard Login
          </p>
        </div>

        {/* Mode toggle */}
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(mode === 'password' ? styles.toggleActive : {}) }}
            onClick={() => setMode('password')}
          >
            Password
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(mode === 'magic' ? styles.toggleActive : {}) }}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcourse.com"
              style={styles.input}
            />
          </div>

          {mode === 'password' && (
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
          )}

          {error && (
            <p style={{ color: C.red, fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Signing in…' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        {!supabase && (
          <p style={{ color: C.red, fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
            Supabase env vars not configured — auth is unavailable.
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: C.gray50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: C.white,
    border: `1px solid ${C.gray200}`,
    borderRadius: 16,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    textAlign: 'center' as const,
  },
  title: { fontSize: '1.25rem', fontWeight: 700, color: C.gray900, marginBottom: '0.5rem' },
  toggle: {
    display: 'flex',
    background: C.gray100,
    borderRadius: 8,
    padding: 4,
    marginBottom: '1.5rem',
  },
  toggleBtn: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    borderRadius: 6,
    padding: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: C.gray600,
    cursor: 'pointer',
  },
  toggleActive: {
    background: C.white,
    color: C.gray900,
    fontWeight: 700,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  field: { marginBottom: '1rem', textAlign: 'left' as const },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.gray600, marginBottom: '0.35rem' },
  input: {
    width: '100%',
    border: `1px solid ${C.gray200}`,
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.9rem',
    color: C.gray900,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    width: '100%',
    background: C.green,
    color: C.white,
    border: 'none',
    borderRadius: 8,
    padding: '0.75rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  linkBtn: {
    marginTop: '1.5rem',
    background: 'none',
    border: 'none',
    color: C.green,
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
