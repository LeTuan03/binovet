export const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN || 'binovet-dev-token';

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
  };

  return fetch(url, { ...options, headers });
}
