const KEY = 'foodchain_token'

export function setToken(token: string) {
  localStorage.setItem(KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(KEY)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}

export function hasToken(): boolean {
  return !!getToken()
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '')
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export function getRole(): string {
  const token = getToken()
  if (!token) return ''
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(base64UrlDecode(payload))
    return json.role || ''
  } catch {
    return ''
  }
}

export function getEmail(): string {
  const token = getToken()
  if (!token) return ''
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(base64UrlDecode(payload))
    return json.email || ''
  } catch {
    return ''
  }
}
