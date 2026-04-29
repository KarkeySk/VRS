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

      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token },
      });

      if (!isMounted) return;

      if (error) {
        setStatus('error');
        setMessage(error.message || 'Unable to verify email');
        return;
      }

      setStatus('success');
      setMessage(data?.message || 'Email verified');
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
        </div>
      </main>
    </div>
  );
}
