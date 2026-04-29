import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@bhatbhati/shared/lib/supabase';
import logo from '../../assets/logo.png';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is required');
        return;
      }

      if (!supabase) {
        setStatus('error');
        setMessage('Verification service is not configured');
        return;
      }

      const { error } = await supabase.functions.invoke('verify-email', {
        body: { token },
      });

      if (!isMounted) return;

      if (error) {
        const errorMessage = await readFunctionError(error);
        setStatus('error');
        setMessage(resolveVerificationError(errorMessage));
        return;
      }

      setStatus('success');
      setMessage('Your email has been successfully verified');
    }

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <img
          src="/images/fleet-suv.png"
          alt=""
          className="auth-visual-image"
          style={{ opacity: 1 }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-brand-row">
            <img src={logo} alt="Bhatbhate" className="auth-brand-logo brand-logo-circle" />
            <span>Bhatbhate</span>
          </div>
          <p className="auth-visual-kicker">Email Verification</p>
          <h2>Secure your account.</h2>
          <p>We are checking your verification link.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verify email</h1>
            <p>
              {status === 'loading'
                ? 'Please wait while we confirm your email address.'
                : message || 'This verification link is missing a token.'}
            </p>
          </div>

          {status === 'loading' && (
            <div className="auth-switch" role="status" aria-live="polite">
              Verifying your email...
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="auth-switch" role="status" aria-live="polite">
                Your email has been successfully verified
              </div>
              <Link to="/auth/login" className="auth-submit">
                Go to Login <ArrowRight size={16} />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="auth-alert" role="alert">
                {message || 'Invalid or expired verification token'}
              </div>
              <button type="button" className="auth-submit" disabled>
                Resend verification email
              </button>
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

async function readFunctionError(error) {
  if (error?.context instanceof Response) {
    try {
      const body = await error.context.clone().json();
      return body?.error || error.message;
    } catch {
      return error.message;
    }
  }

  return error?.message || '';
}

function resolveVerificationError(errorMessage = '') {
  const normalizedMessage = errorMessage.toLowerCase();

  if (normalizedMessage.includes('expired')) {
    return 'Expired verification token';
  }

  if (normalizedMessage.includes('required') || normalizedMessage.includes('missing')) {
    return 'Verification token is required';
  }

  return 'Invalid verification token';
}
