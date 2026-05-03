import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const fleetSlides = [
  {
    image: '/images/fleet-motorcycle.png',
    label: 'Secure Account',
    title: 'Update Your Password',
    description: 'Enter your new password to regain access to your account.',
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

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      setSuccessMessage('Password updated successfully. You can now log in with your new password.');
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
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
            <h1>Update Password</h1>
            <p>Enter a strong new password.</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {successMessage && <div className="auth-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMessage}</div>}

          {!successMessage && (
            <form onSubmit={handleUpdatePassword} className="auth-form">
              <label htmlFor="new-password">New Password</label>
              <div className="auth-password-wrap">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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
              
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="auth-password-wrap">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="auth-switch" style={{ marginTop: '2rem' }}>
            Back to <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
