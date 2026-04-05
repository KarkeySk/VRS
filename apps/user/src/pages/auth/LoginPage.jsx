import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const fleetSlides = [
  {
    image: '/images/fleet-motorcycle.png',
    label: 'BEYOND THE HORIZON',
    title: 'The Ethereal',
    highlight: 'Expedition.',
    description: 'Scale the highest altitudes of the soul. Your journey into the heart of the mountains begins with a single step.',
  },
  {
    image: '/images/fleet-jeep.png',
    label: 'INTO THE WILD',
    title: 'Conquer Every',
    highlight: 'Terrain.',
    description: 'From dense jungles to rugged trails, our fleet takes you where the road ends and adventure begins.',
  },
  {
    image: '/images/fleet-suv.png',
    label: 'SUMMIT SEEKERS',
    title: 'Elevate Your',
    highlight: 'Journey.',
    description: 'Premium SUVs engineered for the most demanding landscapes. Comfort meets capability at every altitude.',
  },
  {
    image: '/images/fleet-pickup.png',
    label: 'HIMALAYAN ROUTES',
    title: 'Power Through',
    highlight: 'Mountains.',
    description: 'Built for the Himalayan backbone. Unstoppable performance on the world\'s most challenging roads.',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTransition, setSlideTransition] = useState(true);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setSlideTransition(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
      setSlideTransition(true);
    }, 400);
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
      navigate('/vehicles');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const slide = fleetSlides[currentSlide];

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex',
      background: '#080808', fontFamily: "'Inter', sans-serif", overflow: 'hidden',
    }}>
      {/* ===== LEFT PANEL — Fleet Image Carousel ===== */}
      <div style={{
        width: '48%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Background Image */}
        {fleetSlides.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0, zIndex: 0,
            opacity: i === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}>
            <img src={s.image} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }} />
          </div>
        ))}

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.05) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, transparent 70%, rgba(8,8,8,0.6) 100%)',
        }} />

        {/* Logo top-left */}
        <div style={{
          position: 'absolute', top: '28px', left: '32px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <img src={logo} alt="Bhatbhati" style={{
            width: '32px', height: '32px', borderRadius: '50%',
            filter: 'drop-shadow(0 0 8px rgba(232,115,42,0.4))',
          }} />
          <span style={{
            fontSize: '0.95rem', fontWeight: '700', color: '#fff',
            letterSpacing: '0.5px',
          }}>Bhatbhati</span>
        </div>

        {/* Bottom text content */}
        <div style={{
          position: 'absolute', bottom: '80px', left: '36px', right: '36px',
          zIndex: 10,
          opacity: slideTransition ? 1 : 0,
          transform: slideTransition ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: '700', color: '#e8732a',
            letterSpacing: '3px', textTransform: 'uppercase', display: 'block',
            marginBottom: '12px',
          }}>{slide.label}</span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800',
            color: '#fff', lineHeight: 1.1, marginBottom: '6px',
          }}>
            {slide.title}<br />
            <span style={{ color: '#e8732a' }}>{slide.highlight}</span>
          </h2>
          <p style={{
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6, maxWidth: '380px', marginTop: '12px',
          }}>{slide.description}</p>
        </div>

        {/* Slide progress indicators */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '36px',
          display: 'flex', gap: '8px', zIndex: 10,
        }}>
          {fleetSlides.map((_, i) => (
            <button key={i} onClick={() => {
              setSlideTransition(false);
              setTimeout(() => { setCurrentSlide(i); setSlideTransition(true); }, 300);
            }} style={{
              width: i === currentSlide ? '32px' : '8px',
              height: '4px', borderRadius: '999px', border: 'none',
              background: i === currentSlide ? '#e8732a' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.4s ease', cursor: 'pointer', padding: 0,
            }} />
          ))}
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', position: 'relative',
        background: 'linear-gradient(145deg, #0e0e10, #0a0a0c)',
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(232,115,42,0.1)', border: '2px solid rgba(232,115,42,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <img src={logo} alt="Bhatbhati" style={{
              width: '36px', height: '36px', borderRadius: '50%', objectFit: 'contain',
            }} />
          </div>
          <h1 style={{
            fontSize: '1.4rem', fontWeight: '800', color: '#fff',
            marginBottom: '6px', letterSpacing: '-0.01em',
          }}>Bhatbhati</h1>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Welcome back, traveler.</p>
        </div>

        {/* Form Container */}
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '10px 14px', marginBottom: '20px',
              color: '#ef4444', fontSize: '0.8rem', textAlign: 'center',
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', fontWeight: '700',
                color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '8px',
              }}>Email Address</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '13px 16px',
                transition: 'border-color 0.2s',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
                </svg>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nomad@expedition.com" required
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
                  }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px',
              }}>
                <label style={{
                  fontSize: '0.65rem', fontWeight: '700', color: '#888',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                }}>Secret Key</label>
                <Link to="#" style={{
                  fontSize: '0.65rem', fontWeight: '700', color: '#e8732a',
                  textDecoration: 'none', letterSpacing: '0.3px',
                }}>Lost your key?</Link>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '13px 16px',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input id="login-password" type={showPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" required
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
                    letterSpacing: showPassword ? 'normal' : '3px',
                  }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    ) : (
                      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button id="login-submit" type="submit" disabled={isLoading} style={{
              width: '100%', padding: '15px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #fcab73, #e8732a)', color: '#000',
              fontSize: '0.9rem', fontWeight: '700', fontFamily: 'inherit',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 4px 24px rgba(232,115,42,0.25)',
              transition: 'all 0.25s ease',
            }}>
              {isLoading ? 'Authenticating...' : 'Enter the Expedition'}
              {!isLoading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            position: 'relative', margin: '28px 0 22px', textAlign: 'center',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0,
              height: '1px', background: 'rgba(255,255,255,0.06)',
            }} />
            <span style={{
              position: 'relative', background: '#0c0c0e',
              padding: '0 16px', fontSize: '0.6rem', color: '#555',
              textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: '600',
            }}>Identify Yourself</span>
          </div>

          {/* Social Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button id="login-google" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              color: '#bbb', fontSize: '0.8rem', fontWeight: '600',
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button id="login-biometric" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              color: '#bbb', fontSize: '0.8rem', fontWeight: '600',
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b81ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
              </svg>
              Biometric
            </button>
          </div>

          {/* Register Link */}
          <p style={{
            textAlign: 'center', marginTop: '28px',
            color: '#666', fontSize: '0.8rem',
          }}>
            New explorer?{' '}
            <Link to="/auth/register" style={{
              color: '#e8732a', fontWeight: '700', textDecoration: 'underline',
              textUnderlineOffset: '3px', textDecorationColor: 'rgba(232,115,42,0.3)',
            }}>Begin your application</Link>
          </p>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '20px', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '28px',
          fontSize: '0.5rem', color: '#444', textTransform: 'uppercase',
          letterSpacing: '2px', fontWeight: '500',
        }}>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Privacy Rituals</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Expedition Terms</a>
          <span>© 2024 Bhatbhati</span>
        </div>
      </div>
    </div>
  );
}
