import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, MailCheck, ShieldCheck } from 'lucide-react'
import { authService } from '@bhatbhati/shared/services/authService.js'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const fleetSlides = [
  {
    image: '/images/fleet-motorcycle.png',
    label: 'Ride More',
    title: 'Plan Your Next Trip',
    description: 'Book vehicles for mountain roads and city roads.',
  },
  {
    image: '/images/fleet-jeep.png',
    label: 'Go Anywhere',
    title: 'Pick The Right Vehicle',
    description: 'From easy roads to rough roads, choose what fits your trip.',
  },
  {
    image: '/images/fleet-suv.png',
    label: 'Easy Travel',
    title: 'Safe And Comfortable',
    description: 'Strong vehicles with comfort and control.',
  },
  {
    image: '/images/fleet-pickup.png',
    label: 'Mountain Roads',
    title: 'Made For Long Routes',
    description: 'Good vehicles for steep roads and changing weather.',
  },
]

function needsMfaChallenge(assurance) {
  return assurance?.nextLevel === 'aal2' && assurance.nextLevel !== assurance.currentLevel
}

function getRecoveryRedirectUrl() {
  return `${window.location.origin}/auth/login?mode=reset-password`
}

export default function LoginPage() {
  const [flow, setFlow] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { signIn, refreshAuthState } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  useEffect(() => {
    let cancelled = false

    const consumeRecoveryParams = async () => {
      const params = new URLSearchParams(location.search)
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''))
      const code = params.get('code')
      const mode = params.get('mode')
      const mfaMode = params.get('mfa')
      const hashType = hashParams.get('type')
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const hasRecoveryCode = Boolean(code && mode === 'reset-password')

      if (mode === 'reset-password') {
        setFlow('reset')
      }

      if (mfaMode === 'required') {
        setFlow('mfa')
        setMessage('Enter your authenticator code to continue.')
      }

      if (!hasRecoveryCode && !(hashType === 'recovery' && accessToken && refreshToken)) return

      setIsLoading(true)
      setError('')
      try {
        if (hasRecoveryCode) {
          await authService.exchangeCodeForSession(code)
        } else {
          await authService.setSession(accessToken, refreshToken)
        }

        if (!cancelled) {
          setFlow('reset')
          setMessage('Recovery verified. Choose a new password.')
          navigate('/auth/login?mode=reset-password', { replace: true })
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Reset link could not be verified.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    consumeRecoveryParams()
    return () => { cancelled = true }
  }, [location.hash, location.search, navigate])

  const clearNotices = () => {
    setError('')
    setMessage('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    clearNotices()
    setIsLoading(true)
    try {
      await signIn(email.trim(), password)
      const assurance = await authService.getAuthenticatorAssuranceLevel()

      if (needsMfaChallenge(assurance)) {
        setFlow('mfa')
        setMessage('Enter your authenticator code to finish signing in.')
        return
      }

      await refreshAuthState()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaVerify = async (e) => {
    e.preventDefault()
    clearNotices()
    setIsLoading(true)
    try {
      await authService.verifyDefaultMfaCode(mfaCode.trim())
      await refreshAuthState()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authenticator code could not be verified.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault()
    clearNotices()
    setIsLoading(true)
    try {
      const cleanEmail = email.trim()
      if (!cleanEmail) throw new Error('Email address is required.')
      await authService.requestPasswordReset(cleanEmail, getRecoveryRedirectUrl())
      setResetSent(true)
      setMessage('Password reset link sent. Open the secure link from your email to choose a new password.')
    } catch (err) {
      setError(err.message || 'Could not send password reset.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    clearNotices()

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      await authService.updatePassword(newPassword)
      await refreshAuthState()
      setMessage('Password updated.')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Password could not be updated.')
    } finally {
      setIsLoading(false)
    }
  }

  const goToSignIn = () => {
    setFlow('sign-in')
    setPassword('')
    setMfaCode('')
    setNewPassword('')
    setConfirmPassword('')
    setResetSent(false)
    clearNotices()
  }

  const slide = fleetSlides[currentSlide]
  const header = {
    'sign-in': ['Welcome back', 'Sign in to continue.'],
    forgot: ['Reset password', 'Use the secure link from your email.'],
    reset: ['Create new password', 'Finish your secure recovery.'],
    mfa: ['Two-factor check', 'Confirm this sign-in.'],
  }[flow]

  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        {fleetSlides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            className="auth-visual-image"
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          />
        ))}
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-brand-row">
            <img src={logo} alt="Bhatbhate" className="auth-brand-logo brand-logo-circle" />
            <span>Bhatbhate</span>
          </div>
          <p className="auth-visual-kicker">{slide.label}</p>
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
          <div className="auth-dots">
            {fleetSlides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                className={index === currentSlide ? 'active' : ''}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{header[0]}</h1>
            <p>{header[1]}</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {message && <div className="auth-alert auth-alert-success">{message}</div>}

          {flow === 'sign-in' && (
            <form onSubmit={handleLogin} className="auth-form">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
              />

              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button type="button" className="auth-link-button" onClick={() => { clearNotices(); setResetSent(false); setFlow('forgot') }}>
                  Forgot password?
                </button>
              </div>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {flow === 'mfa' && (
            <form onSubmit={handleMfaVerify} className="auth-form">
              <div className="auth-step-icon">
                <ShieldCheck size={20} />
              </div>
              <label htmlFor="mfa-code">Authenticator Code</label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                maxLength={8}
                required
              />
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'Verify Code'} <ShieldCheck size={16} />
              </button>
              <button type="button" className="auth-back-button" onClick={goToSignIn}>
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </form>
          )}

          {flow === 'forgot' && (
            <form onSubmit={handlePasswordResetRequest} className="auth-form">
              <div className="auth-step-icon">
                <MailCheck size={20} />
              </div>
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setResetSent(false)
                }}
                placeholder="you@email.com"
                autoComplete="email"
                required
              />

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading
                  ? 'Sending...'
                  : resetSent
                    ? 'Send New Link'
                    : 'Send Reset Link'} <MailCheck size={16} />
              </button>
              <button type="button" className="auth-back-button" onClick={goToSignIn}>
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </form>
          )}

          {flow === 'reset' && (
            <form onSubmit={handlePasswordUpdate} className="auth-form">
              <label htmlFor="new-password">New Password</label>
              <div className="auth-password-wrap">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label htmlFor="confirm-new-password">Confirm Password</label>
              <input
                id="confirm-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                required
              />

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'} <ArrowRight size={16} />
              </button>
              <button type="button" className="auth-back-button" onClick={goToSignIn}>
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </form>
          )}

          {flow === 'sign-in' && (
            <p className="auth-switch">
              New here? <Link to="/auth/register">Create an account</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
