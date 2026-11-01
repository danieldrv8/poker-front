import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AuthApiError } from '../api/auth'

const RESEND_COOLDOWN_SEC = 45

function friendlyError(err: unknown): string {
  if (err instanceof AuthApiError) {
    if (err.code === 'OTP_COOLDOWN') {
      return 'Espera unos segundos antes de pedir otro código.'
    }
    if (err.code === 'INVALID_OTP') {
      return 'Código incorrecto o caducado.'
    }
    if (err.code === 'MISSING_EMAIL') {
      return 'Introduce un email válido.'
    }
    return err.code
  }
  if (err instanceof Error) return err.message
  return String(err)
}

export function AuthScreen({
  onRequestOtp,
  onVerifyOtp,
}: {
  onRequestOtp: (email: string) => Promise<void>
  onVerifyOtp: (email: string, code: string) => Promise<void>
}) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => window.clearTimeout(id)
  }, [resendIn])

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(friendlyError(err))
      throw err
    } finally {
      setBusy(false)
    }
  }

  async function submitEmail(e: FormEvent) {
    e.preventDefault()
    const next = email.trim().toLowerCase()
    if (!next) return
    try {
      await run(async () => {
        await onRequestOtp(next)
      })
      setEmail(next)
      setCode('')
      setStep('code')
      setResendIn(RESEND_COOLDOWN_SEC)
    } catch (err) {
      if (err instanceof AuthApiError && err.code === 'OTP_COOLDOWN') {
        setEmail(next)
        setStep('code')
        setResendIn(RESEND_COOLDOWN_SEC)
      }
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault()
    const digits = code.replace(/\D/g, '').slice(0, 6)
    if (digits.length !== 6) return
    try {
      await run(async () => {
        await onVerifyOtp(email, digits)
      })
    } catch {
      /* error banner set in run */
    }
  }

  async function resend() {
    if (resendIn > 0 || busy) return
    try {
      await run(async () => {
        await onRequestOtp(email)
      })
      setResendIn(RESEND_COOLDOWN_SEC)
    } catch (err) {
      if (err instanceof AuthApiError && err.code === 'OTP_COOLDOWN') {
        setResendIn(RESEND_COOLDOWN_SEC)
      }
    }
  }

  function backToEmail() {
    setError(null)
    setStep('email')
    setCode('')
    setResendIn(0)
  }

  return (
    <div className="lobby">
      <header className="lobby__brand">
        <p className="brand">Felt</p>
        <h1>{step === 'email' ? 'Entra a jugar' : 'Comprueba tu email'}</h1>
        <p className="lobby__lede">
          {step === 'email'
            ? 'Te enviamos un código de 6 dígitos. Sin contraseña.'
            : `Código enviado a ${email}. En local, míralo en los logs del API.`}
        </p>
      </header>

      {step === 'email' ? (
        <form className="lobby__form" onSubmit={(e) => void submitEmail(e)}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              inputMode="email"
              required
              autoFocus
            />
          </label>

          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar código'}
          </button>

          {error && <p className="banner banner--error">{error}</p>}
        </form>
      ) : (
        <form className="lobby__form" onSubmit={(e) => void submitCode(e)}>
          <label className="field">
            <span>Código</span>
            <input
              className="field__otp"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              required
              autoFocus
            />
          </label>

          <button
            className="btn btn--primary"
            type="submit"
            disabled={busy || code.length !== 6}
          >
            {busy ? 'Verificando…' : 'Entrar'}
          </button>

          <div className="auth__actions">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={busy || resendIn > 0}
              onClick={() => void resend()}
            >
              {resendIn > 0 ? `Reenviar en ${resendIn}s` : 'Reenviar código'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={busy}
              onClick={backToEmail}
            >
              Usar otro email
            </button>
          </div>

          {error && <p className="banner banner--error">{error}</p>}
        </form>
      )}
    </div>
  )
}
