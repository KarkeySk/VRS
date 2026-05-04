import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'mfa'
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { signIn, getMfaLevel, listMfaFactors, challengeAndVerifyMfa } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Check if MFA is required
      const mfaLevel = await getMfaLevel();
      if (mfaLevel?.nextLevel === 'aal2' && mfaLevel?.currentLevel !== 'aal2') {
          const factorsData = await listMfaFactors();
          const totpFactor = factorsData?.totp?.[0];
          if (totpFactor) {
              setFactorId(totpFactor.id);
              setStep('mfa');
              return; // Wait for MFA verification
          }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        await challengeAndVerifyMfa(factorId, mfaCode);
        navigate('/dashboard');
    } catch (err) {
        setError(err.message || 'Invalid 2FA code');
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

          {error && <div className="auth-alert">{error}</div>}

          {step === 'login' ? (
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '-0.5rem' }}>
              <Link to="/auth/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMfa} className="auth-form">
              <label htmlFor="mfa-code">6-Digit Code</label>
              <div className="auth-password-wrap">
                <input
                  id="mfa-code"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
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
                    textDecoration: 'underline'
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
