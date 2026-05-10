import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Mail, RefreshCw, XCircle } from 'lucide-react';
import { authService } from '@bhatbhati/shared/services/authService.js';
import { getEmailError, getFriendlyAuthError } from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';

const verificationStates = {
  checking: {
    Icon: RefreshCw,
    title: 'Verifying email',
    message: 'Hang tight while we confirm your email address.',
  },
  success: {
    Icon: CheckCircle,
    title: 'Email verified',
    message: 'Your account is ready. Taking you to your dashboard now.',
  },
  needsLink: {
    Icon: Mail,
    title: 'Check your email',
    message: 'Email verification is required before you can sign in.',
  },
  error: {
    Icon: XCircle,
    title: 'Verification failed',
    message: 'This link is invalid or has expired. Send yourself a fresh link below.',
  },
};

function getHashParams(hash) {
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(cleanHash);
}

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resendError, setResendError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hash = useMemo(() => getHashParams(location.hash), [location.hash]);
  const state = verificationStates[status];
  const StateIcon = state.Icon;

  useEffect(() => {
    let cancelled = false;
    let redirectTimer;

    const completeVerification = async () => {
      setStatus('checking');
      setMessage('');

      const providerError =
        query.get('error_description') ||
        hash.get('error_description') ||
        query.get('error_code') ||
        hash.get('error_code') ||
        query.get('error') ||
        hash.get('error');

      if (providerError) {
        setStatus('error');
        setMessage(getFriendlyAuthError(providerError, verificationStates.error.message));
        return;
      }

      try {
        const code = query.get('code');
        const tokenHash = query.get('token_hash') || hash.get('token_hash');
        const type = query.get('type') || hash.get('type') || 'email';
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');

        if (code) {
          await authService.exchangeCodeForSession(code);
        } else if (tokenHash) {
          await authService.verifyEmailOtp(tokenHash, type);
        } else if (accessToken && refreshToken) {
          await authService.setSession(accessToken, refreshToken);
        } else {
          const session = await authService.getSession();
          if (!session) {
            if (!cancelled) setStatus('needsLink');
            return;
          }
        }

        if (!cancelled) {
          setStatus('success');
          redirectTimer = window.setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1800);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(getFriendlyAuthError(err, verificationStates.error.message));
        }
      }
    };

    completeVerification();

    return () => {
      cancelled = true;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [hash, navigate, query]);

  const handleResend = async (event) => {
    event.preventDefault();
    setResendStatus('');
    setResendError('');

    const emailError = getEmailError(email);
    setFieldErrors({ email: emailError });
    if (emailError) return;

    setIsResending(true);

    try {
      await authService.resendConfirmation(email.trim());
      setResendStatus('A new verification email has been sent.');
    } catch (err) {
      setResendError(getFriendlyAuthError(err, 'Could not resend the verification email. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-shell verify-shell">
      <aside className="auth-visual verify-visual">
        <img src="/images/hero-mountain.png" alt="" className="auth-visual-image" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-brand-row">
            <img src={logo} alt="Bhatbhate" className="auth-brand-logo brand-logo-circle" />
            <span>Bhatbhate</span>
          </div>
          <p className="auth-visual-kicker">Email Verification</p>
          <h2>One quick check before the road opens.</h2>
          <p>Email verification is required before sign-in so bookings, documents, and trip updates stay tied to the right account.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card verify-card">
          <div className={`verify-icon ${status}`}>
            <StateIcon size={28} />
          </div>

          <div className="auth-header verify-header">
            <h1>{state.title}</h1>
            <p>{message || state.message}</p>
          </div>

          {status === 'checking' && <div className="verify-progress" aria-hidden="true" />}

          {status === 'success' && (
            <Link to="/dashboard" className="auth-submit verify-link">
              Continue <ArrowRight size={16} />
            </Link>
          )}

          {(status === 'needsLink' || status === 'error') && (
            <>
              <form onSubmit={handleResend} className="auth-form verify-resend-form" noValidate>
                <label htmlFor="verify-email">Email Address</label>
                <input
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="you@email.com"
                  disabled={isResending}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'verify-email-error' : undefined}
                />
                {fieldErrors.email && <p className="auth-field-error" id="verify-email-error">{fieldErrors.email}</p>}
                <button type="submit" className="auth-submit" disabled={isResending} aria-busy={isResending}>
                  {isResending ? 'Sending...' : 'Send Verification Email'} <Mail size={16} />
                </button>
              </form>

              {resendStatus && <div className="auth-alert auth-alert-success">{resendStatus}</div>}
              {resendError && <div className="auth-alert">{resendError}</div>}

              <p className="auth-switch">
                Already verified? <Link to="/auth/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
