export interface AuthUser {
  id: string
  email: string
}

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

const KEY = 'felt.auth'

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (
      typeof parsed.accessToken !== 'string' ||
      !parsed.user ||
      typeof parsed.user.id !== 'string' ||
      typeof parsed.user.email !== 'string'
    ) {
      return null
    }
    return { accessToken: parsed.accessToken, user: parsed.user }
  } catch {
    return null
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  localStorage.removeItem(KEY)
}
