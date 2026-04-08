import type { Context, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { createAdminClient } from '../lib/supabase';
import { unauthorized } from '../lib/errors';

export type AuthUser = {
  id: string;
  email: string | undefined;
  role: string;
};

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    accessToken: string;
  }
}

export const authMiddleware: MiddlewareHandler = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    unauthorized('Invalid or expired token');
  }

  c.set('user', {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role ?? 'authenticated',
  });
  c.set('accessToken', token);

  await next();
});

/** Optional auth — sets user if token is present, but doesn't reject missing tokens */
export const optionalAuth: MiddlewareHandler = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createAdminClient();
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      c.set('user', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role ?? 'authenticated',
      });
      c.set('accessToken', token);
    }
  }
  await next();
});
