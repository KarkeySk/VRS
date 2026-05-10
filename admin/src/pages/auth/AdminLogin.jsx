import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@bhatbhati/shared/services/authService.js'
import {
  getEmailError,
  getFriendlyAuthError,
  getPasswordError,
} from '@bhatbhati/shared/utils/authFeedback.js'

export default function AdminLogin() {
  // Form state for credentials.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // UI states for feedback.
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  // Router navigation after login.
  const navigate = useNavigate()

  const updateField = (name, value) => {
    if (name === 'email') setEmail(value)
    if (name === 'password') setPassword(value)
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateLogin = () => {
    const nextErrors = {
      email: getEmailError(email),
      password: getPasswordError(password),
    }
    setFieldErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleLogin = async (e) => {
    // Authenticate and redirect to the admin dashboard.
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!validateLogin()) return
    // Lock the form while we authenticate.
    setIsLoading(true)
    try {
      // Perform sign-in with the auth service.
      await authService.signIn(email.trim(), password)
      // Route to the dashboard on success.
      setSuccess('Login successful. Opening the admin dashboard...')
      window.setTimeout(() => navigate('/dashboard'), 650)
    } catch (err) {
      // Show a message on failure.
      setError(getFriendlyAuthError(err, 'We could not sign you in. Please try again.'))
    } finally {
      // Re-enable the form.
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0a', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', padding: '40px',
        background: '#111', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
          Admin Panel
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '28px' }}>
          Bhatbhate Management Console
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '10px', marginBottom: '16px',
            color: '#ef4444', fontSize: '0.8rem',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '8px', padding: '10px', marginBottom: '16px',
            color: '#22c55e', fontSize: '0.8rem',
          }}>{success}</div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Email
          </label>
          <input type="email" value={email} onChange={(e) => updateField('email', e.target.value)}
            placeholder="admin@bhatbhate.com" disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            style={{
              width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
              border: fieldErrors.email ? '1px solid rgba(239,68,68,0.75)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '0.85rem', marginBottom: '16px', outline: 'none',
              boxSizing: 'border-box',
            }} />
          {fieldErrors.email && (
            <p style={{ color: '#f87171', fontSize: '0.76rem', margin: '-10px 0 14px' }}>{fieldErrors.email}</p>
          )}

          <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Password
          </label>
          <input type="password" value={password} onChange={(e) => updateField('password', e.target.value)}
            placeholder="Enter password" disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            style={{
              width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
              border: fieldErrors.password ? '1px solid rgba(239,68,68,0.75)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '0.85rem', marginBottom: '24px', outline: 'none',
              boxSizing: 'border-box',
            }} />
          {fieldErrors.password && (
            <p style={{ color: '#f87171', fontSize: '0.76rem', margin: '-18px 0 20px' }}>{fieldErrors.password}</p>
          )}

          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
            background: '#e8732a', color: '#fff', fontSize: '0.9rem', fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
          }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
