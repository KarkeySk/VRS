import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEmailError, getFriendlyAuthError } from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';

const fleetSlides = [
  {
    image: '/images/fleet-motorcycle.png',
    label: 'Secure Account',
    title: 'Reset Your Password',
    description: 'Enter your email to receive a password reset link.',
  },
  {
    image: '/images/fleet-jeep.png',
    label: 'Quick Recovery',
    title: 'Get Back on the Road',
    description: 'We will help you restore your access in no time.',
  },
  {
    image: '/images/fleet-suv.png',
    label: 'Always Safe',
    title: 'Protected Information',
    description: 'Your account security is our top priority.',
  },
  {
    image: '/images/fleet-pickup.png',
    label: 'Need Help?',
    title: 'Support Available',
    description: 'Contact our team if you need further assistance.',
  },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [linkSent, setLinkSent] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { resetPasswordForEmail } = useAuth();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setError('');

    const emailError = getEmailError(email);
    setFieldErrors({ email: emailError });
    if (emailError) return;

    setIsLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setLinkSent(true);
    } catch (err) {
      setError(getFriendlyAuthError(err, 'We could not send a reset email. Please try again.'));
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
          {!linkSent ? (
            <>
              <div className="auth-header">
                <h1>Forgot Password</h1>
                <p>Enter your email and we'll send you a reset link.</p>
              </div>

              {error && <div className="auth-alert">{error}</div>}

              <form onSubmit={handleSendResetLink} className="auth-form" noValidate>
                <label htmlFor="reset-email">Email Address</label>
                <div className="auth-password-wrap">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="you@email.com"
                    disabled={isLoading}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    disabled
                    aria-hidden="true"
                  >
                    <Mail size={16} />
                  </button>
                </div>
                {fieldErrors.email && <p className="auth-field-error" id="reset-email-error">{fieldErrors.email}</p>}

                <button type="submit" className="auth-submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <CheckCircle size={32} style={{ color: '#10b981' }} />
              </div>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 700 }}>Check Your Email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. 
                Click the link in your email to set a new password.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false);
                  setError('');
                }}
                className="auth-submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Try Again <ArrowRight size={16} />
              </button>
            </div>
          )}

          <p className="auth-switch" style={{ marginTop: '2rem' }}>
            Remembered your password? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
