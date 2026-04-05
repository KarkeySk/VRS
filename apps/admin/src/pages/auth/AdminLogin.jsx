import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@bhatbhati/shared/services/authService.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await authService.signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
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
          Bhatbhati Management Console
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '10px', marginBottom: '16px',
            color: '#ef4444', fontSize: '0.8rem',
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Email
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bhatbhati.com" required
            style={{
              width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '0.85rem', marginBottom: '16px', outline: 'none',
              boxSizing: 'border-box',
            }} />

          <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Password
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required
            style={{
              width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '0.85rem', marginBottom: '24px', outline: 'none',
              boxSizing: 'border-box',
            }} />

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
