import { useCallback, useState } from 'react'
import { requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp } from '../api/auth'
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  type AuthSession,
} from '../lib/authStorage'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadAuthSession(),
  )
  const [ready] = useState(true)

  const requestOtp = useCallback(async (email: string) => {
    await apiRequestOtp(email.trim().toLowerCase())
  }, [])

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const next = await apiVerifyOtp(email.trim().toLowerCase(), code.trim())
    saveAuthSession(next)
    setSession(next)
    return next
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setSession(null)
  }, [])

  return {
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    ready,
    requestOtp,
    verifyOtp,
    logout,
  }
}
