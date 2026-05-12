import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { authService } from '@bhatbhati/shared/services/authService.js';
import { getFriendlyAuthError } from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';

const callbackStates = {
  checking: {
    Icon: RefreshCw,
    title: 'Signing you in',
    message: 'Finishing up your Google sign-in...',
  },
  success: {
    Icon: CheckCircle,
    title: 'Signed in',
    message: 'You\'re in. Taking you to your dashboard now.',
  },
  error: {
    Icon: XCircle,
    title: 'Sign-in failed',
    message: 'We could not complete the sign-in. Please try again.',
  },
};

function getHashParams(hash) {
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(cleanHash);
}

export default function OAuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hash = useMemo(() => getHashParams(location.hash), [location.hash]);
  const state = callbackStates[status];
  const StateIcon = state.Icon;

  useEffect(() => {
    let cancelled = false;
    let redirectTimer;

    const completeSignIn = async () => {
      const providerError =
        query.get('error_description') ||
        hash.get('error_description') ||
        query.get('error_code') ||
        hash.get('error_code') ||
        query.get('error') ||
        hash.get('error');

      if (providerError) {
        if (!cancelled) {
          setStatus('error');
          setMessage(getFriendlyAuthError(providerError, callbackStates.error.message));
        }
        return;
      }

      try {
        const code = query.get('code');
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');

        if (code) {
          await authService.exchangeCodeForSession(code);
        } else if (accessToken && refreshToken) {
          await authService.setSession(accessToken, refreshToken);
        } else {
          const session = await authService.getSession();
          if (!session) {
            if (!cancelled) {
              setStatus('error');
              setMessage('No sign-in token was found in the redirect URL.');
            }
            return;
          }
        }

        if (!cancelled) {
          setStatus('success');
          redirectTimer = window.setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 900);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(getFriendlyAuthError(err, callbackStates.error.message));
        }
      }
    };

    completeSignIn();

    return () => {
      cancelled = true;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [hash, navigate, query]);

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
          <p className="auth-visual-kicker">Google Sign-In</p>
          <h2>Almost there.</h2>
          <p>We're finishing your Google sign-in and getting your dashboard ready.</p>
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

          {status === 'error' && (
            <p className="auth-switch">
              <Link to="/auth/login">Back to sign in</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
