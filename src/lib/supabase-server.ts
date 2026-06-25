import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service-role key.
 * Dùng cho upload file lên Supabase Storage (bypass RLS).
 *
 * Trả về null nếu chưa có service-role key → route sẽ fallback về filesystem
 * (chỉ dùng cho local dev).
 */

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

/**
 * Lấy URL project Supabase.
 * Ưu tiên env tường minh, nếu không có thì suy ra từ DATABASE_URL / DIRECT_URL
 * (vốn đã được set sẵn trên Netlify) → đỡ phải khai báo thừa biến.
 */
function resolveSupabaseUrl(): string | undefined {
  const explicit = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const db = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!db) return undefined;

  try {
    const u = new URL(db);
    // Pooler: username = "postgres.<project-ref>"
    const fromUser = u.username.split('.')[1];
    if (fromUser) return `https://${fromUser}.supabase.co`;
    // Direct: host = "db.<project-ref>.supabase.co"
    const hostParts = u.hostname.split('.');
    if (hostParts[0] === 'db' && hostParts[1]) {
      return `https://${hostParts[1]}.supabase.co`;
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = resolveSupabaseUrl();
  if (!serviceRoleKey || !supabaseUrl) return null;
  if (cached) return cached;
  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
