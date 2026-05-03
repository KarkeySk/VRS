import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

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

const verificationStorageKeys = [
  'pending_email_verification',
  'pendingEmailVerification',
  'email_verification_required',
  'verification_email_sent',
];

function clearVerificationState() {
  verificationStorageKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function getPendingVerificationEmail() {
  return sessionStorage.getItem('pending_email_verification') || '';
}

function isUnverifiedEmailError(message) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('email not confirmed') || lowerMessage.includes('email not verified');
}

function hasVerifiedEmail(user) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { resendVerificationEmail, signIn, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  useEffect(() => {
    const message = location.state?.message;
    const pendingEmail = location.state?.email || getPendingVerificationEmail();
    if (message) setNotice(message);
    if (pendingEmail) setEmail(pendingEmail);
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await signIn(normalizedEmail, password);
      if (!hasVerifiedEmail(data?.user)) {
        await signOut();
        sessionStorage.setItem('pending_email_verification', normalizedEmail);
        setError('Please verify your email before signing in');
        return;
      }
      clearVerificationState();
      navigate('/dashboard');
    } catch (err) {
      const message = err.message || 'Failed to login';
      setError(
        isUnverifiedEmailError(message)
          ? 'Please verify your email before signing in'
          : message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = email.trim().toLowerCase() || getPendingVerificationEmail();
    if (!targetEmail) {
      setError('Enter your email address first.');
      return;
    }

    setError('');
    setNotice('');
    setIsLoading(true);
    try {
      await resendVerificationEmail(targetEmail);
      sessionStorage.setItem('pending_email_verification', targetEmail);
      setNotice('Verification email sent. Check your inbox before signing in.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
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
            <h1>Welcome back</h1>
            <p>Sign in to continue.</p>
          </div>

          {notice && <div className="auth-alert">{notice}</div>}
          {error && <div className="auth-alert">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="auth-password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <button
            type="button"
            className="auth-submit"
            disabled={isLoading}
            onClick={handleResendVerification}
            style={{ marginTop: '12px' }}
          >
            Resend verification email
          </button>

          <p className="auth-switch">
            New here? <Link to="/auth/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
