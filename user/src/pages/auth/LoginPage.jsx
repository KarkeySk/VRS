import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEmailError,
  getFriendlyAuthError,
  getPasswordError,
  isEmailVerificationError,
} from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13 4.5 4 13.5 4 24.5s9 20 20 20 20-9 20-20c0-1.4-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5c-7.6 0-14.2 4.3-17.7 10.2z"/>
      <path fill="#4CAF50" d="M24 44.5c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.3 2.2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 40.1 16.2 44.5 24 44.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2c-.4.4 6.7-4.9 6.7-14.3 0-1.4-.1-2.7-.4-4z"/>
    </svg>
  );
}

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
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resendError, setResendError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'mfa'
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    signIn,
    signInWithGoogle,
    resendConfirmation,
    getMfaLevel,
    listMfaFactors,
    challengeAndVerifyMfa,
  } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Browser is being redirected to Google; nothing else to do here.
    } catch (err) {
      console.error('[Google OAuth] error:', err?.message, err?.status, err);
      setError(getFriendlyAuthError(err, 'Could not start Google sign-in. Please try again.'));
      setIsGoogleLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const updateField = (name, value) => {
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'mfaCode') setMfaCode(value);
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateLogin = () => {
    const nextErrors = {
      email: getEmailError(email),
      password: getPasswordError(password),
    };
    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setVerificationRequired(false);
    setResendStatus('');
    setResendError('');

    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      const mfaLevel = await getMfaLevel();
      if (mfaLevel?.nextLevel === 'aal2' && mfaLevel?.currentLevel !== 'aal2') {
        const factorsData = await listMfaFactors();
        const totpFactor = factorsData?.totp?.[0];
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setStep('mfa');
          return;
        }
      }
      setSuccess('Login successful. Taking you to your dashboard...');
      window.setTimeout(() => navigate('/dashboard'), 650);
    } catch (err) {
      if (isEmailVerificationError(err)) {
        setVerificationRequired(true);
        setError('Email verification is required before you can sign in.');
      } else {
        setError(getFriendlyAuthError(err, 'We could not sign you in. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('');
    setResendError('');

    const emailError = getEmailError(email);
    if (emailError) {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsResending(true);

    try {
      await resendConfirmation(email.trim());
      setResendStatus('Verification email sent. Open the link first; sign-in stays blocked until verification is complete.');
    } catch (err) {
      setResendError(getFriendlyAuthError(err, 'Could not send verification email. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mfaCode.trim()) {
      setFieldErrors((prev) => ({ ...prev, mfaCode: 'Verification code is required.' }));
      return;
    }

    setIsLoading(true);
    try {
      await challengeAndVerifyMfa(factorId, mfaCode);
      setSuccess('Login successful. Taking you to your dashboard...');
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyAuthError(err, 'The verification code is incorrect. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const slide = fleetSlides[currentSlide];

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
            <h1>{step === 'login' ? 'Welcome back' : 'Two-Factor Authentication'}</h1>
            <p>{step === 'login' ? 'Sign in to continue.' : 'Enter the 6-digit code from your authenticator app.'}</p>
          </div>

          {error && (
            <div className={verificationRequired ? 'auth-alert auth-alert-warning' : 'auth-alert'}>
              {verificationRequired && <Mail size={16} />}
              {error}
            </div>
          )}
          {resendStatus && <div className="auth-alert auth-alert-success">{resendStatus}</div>}
          {resendError && <div className="auth-alert">{resendError}</div>}
          {success && <div className="auth-alert auth-alert-success">{success}</div>}

          {step === 'login' ? (
            <>
              <button
                type="button"
                className="auth-secondary-action auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                aria-busy={isGoogleLoading}
              >
                <GoogleIcon />
                {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>

              <div className="auth-divider"><span>or continue with email</span></div>

              <form onSubmit={handleLogin} className="auth-form" noValidate>
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@email.com"
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                />
                {fieldErrors.email && <p className="auth-field-error" id="login-email-error">{fieldErrors.email}</p>}

                <label htmlFor="login-password">Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="auth-field-error" id="login-password-error">{fieldErrors.password}</p>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                  <Link to="/auth/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" className="auth-submit" disabled={isLoading} aria-busy={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
                </button>
              </form>

              {verificationRequired && (
                <button
                  type="button"
                  className="auth-secondary-action"
                  onClick={handleResendVerification}
                  disabled={isResending || !email.trim()}
                  aria-busy={isResending}
                >
                  {isResending ? 'Sending...' : 'Send verification email'} <Mail size={16} />
                </button>
              )}
            </>
          ) : (
            <form onSubmit={handleVerifyMfa} className="auth-form" noValidate>
              <label htmlFor="mfa-code">6-Digit Code</label>
              <div className="auth-password-wrap">
                <input
                  id="mfa-code"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => updateField('mfaCode', e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.mfaCode)}
                  aria-describedby={fieldErrors.mfaCode ? 'mfa-code-error' : undefined}
                  autoFocus
                />
              </div>
              {fieldErrors.mfaCode && <p className="auth-field-error" id="mfa-code-error">{fieldErrors.mfaCode}</p>}

              <button type="submit" className="auth-submit" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify'} <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {step === 'login' && (
            <p className="auth-switch">
              New here? <Link to="/auth/register">Create an account</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
