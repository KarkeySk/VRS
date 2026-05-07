import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { resetPasswordForEmail, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await resetPasswordForEmail(email);
      setSuccessMessage('An OTP has been sent to your email.');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate('/auth/update-password');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
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
            <h1>{step === 'email' ? 'Forgot Password' : 'Enter OTP'}</h1>
            <p>{step === 'email' ? 'Enter your email to reset your password.' : 'Enter the 6-digit code sent to your email.'}</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {successMessage && step === 'email' && <div className="auth-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMessage}</div>}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <label htmlFor="reset-email">Email Address</label>
              <div className="auth-password-wrap">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
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

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <label htmlFor="verify-otp">6-Digit OTP</label>
              <div className="auth-password-wrap">
                <input
                  id="verify-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-toggle"
                  disabled
                  aria-hidden="true"
                >
                  <KeyRound size={16} />
                </button>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setSuccessMessage('');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch" style={{ marginTop: '2rem' }}>
            Remembered your password? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
