import { getToken } from './auth'

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any)
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    const errJson = errText ? JSON.parse(errText) : { error: res.statusText }
    throw new Error((errJson as any).error || 'Request failed')
  }

  if (res.status === 204) return undefined as any
  const text = await res.text()
  if (!text) return undefined as any
  return JSON.parse(text) as T
}
