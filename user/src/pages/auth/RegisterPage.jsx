import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEmailError,
  getFriendlyAuthError,
  getPasswordError,
  getPhoneError,
  getRequiredError,
} from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';

const fleetSlides = [
  {
    image: '/images/fleet-jeep.png',
    title: 'Start your next trip here.',
    subtitle: 'Create an account to get better vehicle suggestions.',
  },
  {
    image: '/images/fleet-motorcycle.png',
    title: 'Two wheels. Big views.',
    subtitle: 'Fill your profile once for better matches.',
  },
  {
    image: '/images/fleet-suv.png',
    title: 'Comfort and control.',
    subtitle: 'Pick what fits your travel style.',
  },
  {
    image: '/images/fleet-pickup.png',
    title: 'Ready for long roads.',
    subtitle: 'Join and find good options across Nepal.',
  },
];

export default function RegisterPage() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [terrain, setTerrain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const updateField = (name, value) => {
    if (name === 'fullname') setFullname(value);
    if (name === 'email') setEmail(value);
    if (name === 'phone') setPhone(value);
    if (name === 'password') setPassword(value);
    if (name === 'terrain') setTerrain(value);
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateRegister = () => {
    const nextErrors = {
      fullname: getRequiredError(fullname, 'Full name is required.'),
      email: getEmailError(email),
      phone: getPhoneError(phone),
      password: getPasswordError(password),
      terrain: getRequiredError(terrain, 'Road preference is required.'),
    };
    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateRegister()) return;

    setIsLoading(true);
    try {
      const data = await signUp(email.trim(), password, {
        full_name: fullname.trim(),
        phone: phone.trim(),
        terrain_preference: terrain,
      });
      if (data?.session) {
        setSuccess('Account created. Taking you to your dashboard...');
        window.setTimeout(() => navigate('/dashboard'), 650);
        return;
      }
      setSuccess('Account created. Email verification is required before you can sign in.');
    } catch (err) {
      setError(getFriendlyAuthError(err, 'We could not create your account. Please try again.'));
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
          <p className="auth-visual-kicker">Join Now</p>
          <h2>{slide.title}</h2>
          <p>{slide.subtitle}</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create account</h1>
            <p>Set up your profile and start booking.</p>
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {success && (
            <div className="auth-alert auth-alert-success">
              <Mail size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form" noValidate>
            <label htmlFor="register-fullname">Full Name</label>
            <input
              id="register-fullname"
              type="text"
              value={fullname}
              onChange={(e) => updateField('fullname', e.target.value)}
              placeholder="John Everest"
              disabled={isLoading || Boolean(success)}
              aria-invalid={Boolean(fieldErrors.fullname)}
              aria-describedby={fieldErrors.fullname ? 'register-fullname-error' : undefined}
            />
            {fieldErrors.fullname && <p className="auth-field-error" id="register-fullname-error">{fieldErrors.fullname}</p>}

            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@email.com"
              disabled={isLoading || Boolean(success)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
            />
            {fieldErrors.email && <p className="auth-field-error" id="register-email-error">{fieldErrors.email}</p>}

            <label htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+977 9841xxxxxx"
              disabled={isLoading || Boolean(success)}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'register-phone-error' : undefined}
            />
            {fieldErrors.phone && <p className="auth-field-error" id="register-phone-error">{fieldErrors.phone}</p>}

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Create a secure password"
              disabled={isLoading || Boolean(success)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
            />
            {fieldErrors.password && <p className="auth-field-error" id="register-password-error">{fieldErrors.password}</p>}

            <label htmlFor="register-terrain">Road Preference</label>
            <select
              id="register-terrain"
              value={terrain}
              onChange={(e) => updateField('terrain', e.target.value)}
              disabled={isLoading || Boolean(success)}
              aria-invalid={Boolean(fieldErrors.terrain)}
              aria-describedby={fieldErrors.terrain ? 'register-terrain-error' : undefined}
            >
              <option value="" disabled>Select road type...</option>
              <option value="mountains">Mountain Roads</option>
              <option value="valley">Kathmandu Valley</option>
              <option value="offroad">Off-road</option>
              <option value="highway">Highways</option>
            </select>
            {fieldErrors.terrain && <p className="auth-field-error" id="register-terrain-error">{fieldErrors.terrain}</p>}

            <button type="submit" className="auth-submit" disabled={isLoading || Boolean(success)}>
              {isLoading ? 'Creating account...' : success ? 'Verification Email Sent' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
