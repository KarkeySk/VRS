import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  const [password, setPassword] = useState('');
  const [terrain, setTerrain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signUp(email, password, { full_name: fullname, terrain_preference: terrain });
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
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

          <form onSubmit={handleRegister} className="auth-form">
            <label htmlFor="register-fullname">Full Name</label>
            <input
              id="register-fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="John Everest"
              required
            />

            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              required
            />

            <label htmlFor="register-terrain">Road Preference</label>
            <select
              id="register-terrain"
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              required
            >
              <option value="" disabled>Select road type...</option>
              <option value="mountains">Mountain Roads</option>
              <option value="valley">Kathmandu Valley</option>
              <option value="offroad">Off-road</option>
              <option value="highway">Highways</option>
            </select>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
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
