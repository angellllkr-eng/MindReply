// Lightweight client used by every page. Mirrors the axios-style
// `res.data.data` shape the original frontend was written against, but talks to
// the local Next.js route handlers under /api.

const BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function request<T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error((json && (json.error || json.message)) || `Request failed (${res.status})`)
  }

  return { data: json as T }
}

export const apiClient = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T = any>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
}

export default apiClient
