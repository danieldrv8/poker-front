import type { AuthSession, AuthUser } from '../lib/authStorage'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class AuthApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string) {
    super(code)
    this.name = 'AuthApiError'
    this.status = status
    this.code = code
  }
}

function nestMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return 'UNKNOWN_ERROR'
  const message = (body as { message?: unknown }).message
  if (typeof message === 'string') return message
  if (Array.isArray(message) && message.length > 0) {
    return String(message[0])
  }
  return 'UNKNOWN_ERROR'
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new AuthApiError(res.status, nestMessage(data))
  }

  return data as T
}

export async function requestOtp(email: string): Promise<void> {
  await postJson<{ ok: boolean }>('/auth/request-otp', { email })
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<AuthSession> {
  const data = await postJson<{
    accessToken: string
    user: AuthUser
  }>('/auth/verify-otp', { email, code })

  return { accessToken: data.accessToken, user: data.user }
}
