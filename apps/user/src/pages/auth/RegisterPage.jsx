import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const fleetSlides = [
  {
    image: '/images/fleet-jeep.png',
    title: 'Your descent into the wild begins here.',
    quote: '"The best routes aren\'t on the map."',
    author: 'Tenzing K., Lead Explorer',
  },
  {
    image: '/images/fleet-motorcycle.png',
    title: 'Two wheels, infinite horizons ahead.',
    quote: '"Every mountain pass is a story waiting to be lived."',
    author: 'Samir R., Trail Rider',
  },
  {
    image: '/images/fleet-suv.png',
    title: 'Elevate your expedition to new heights.',
    quote: '"The summit is just the beginning of the view."',
    author: 'Priya M., Alpine Guide',
  },
  {
    image: '/images/fleet-pickup.png',
    title: 'Power meets purpose on every trail.',
    quote: '"In the mountains, the vehicle is your lifeline."',
    author: 'Bikram S., Route Captain',
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
  const [slideTransition, setSlideTransition] = useState(true);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setSlideTransition(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % fleetSlides.length);
      setSlideTransition(true);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
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

  const inputWrap = {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '13px 16px',
    transition: 'border-color 0.2s',
  };

  const inputField = {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.6rem', fontWeight: '700', color: '#888',
    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px',
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex',
      background: '#080808', fontFamily: "'Inter', sans-serif", overflow: 'hidden',
    }}>
      {/* ===== LEFT PANEL — Fleet Image Carousel ===== */}
      <div style={{
        width: '45%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Background Images */}
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
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.08) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, transparent 65%, rgba(8,8,8,0.7) 100%)',
        }} />

        {/* Logo top-left */}
        <div style={{
          position: 'absolute', top: '28px', left: '32px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <img src={logo} alt="Bhatbhati" style={{
            width: '28px', height: '28px', borderRadius: '50%',
            filter: 'drop-shadow(0 0 8px rgba(232,115,42,0.4))',
          }} />
          <span style={{
            fontSize: '0.85rem', fontWeight: '700', color: '#fff',
            letterSpacing: '0.5px',
          }}>Bhatbhati</span>
        </div>

        {/* Bottom text content */}
        <div style={{
          position: 'absolute', bottom: '100px', left: '36px', right: '36px',
          zIndex: 10,
          opacity: slideTransition ? 1 : 0,
          transform: slideTransition ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800',
            color: '#fff', lineHeight: 1.15, marginBottom: '20px',
          }}>{slide.title}</h2>
        </div>

        {/* Testimonial Quote */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '36px', right: '36px',
          zIndex: 10,
          opacity: slideTransition ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
            borderRadius: '14px', padding: '14px 18px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(232,115,42,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '2px solid rgba(232,115,42,0.3)',
            }}>
              <img src={logo} alt="" style={{
                width: '22px', height: '22px', borderRadius: '50%',
              }} />
            </div>
            <div>
              <p style={{
                fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic', lineHeight: 1.4,
              }}>{slide.quote}</p>
              <p style={{
                fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)',
                marginTop: '4px',
              }}>{slide.author}</p>
            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '36px',
          zIndex: 10, fontSize: '0.45rem', color: 'rgba(255,255,255,0.2)',
          letterSpacing: '1.5px',
        }}>
          © 2024 Bhatbhati. The Ethereal Expedition.
        </div>
      </div>

      {/* ===== RIGHT PANEL — Register Form ===== */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 40px', position: 'relative',
        background: 'linear-gradient(145deg, #0e0e10, #0a0a0c)',
        overflowY: 'auto',
      }}>
        {/* Form Container */}
        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(18,18,22,0.6)', backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px',
          padding: '36px 32px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: '800', color: '#fff',
              marginBottom: '6px',
            }}>Create your profile</h1>
            <p style={{
              color: '#666', fontSize: '0.78rem', lineHeight: 1.5,
            }}>Join the most exclusive adventure collective.</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '10px 14px', marginBottom: '18px',
              color: '#ef4444', fontSize: '0.8rem', textAlign: 'center',
            }}>{error}</div>
          )}

          <form onSubmit={handleRegister}>
            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="register-fullname" type="text" value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Everest" required style={inputField} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email Address</label>
              <div style={inputWrap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input id="register-email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@expedition.com" required style={inputField} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input id="register-password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inputField, letterSpacing: '3px' }} />
              </div>
            </div>

            {/* Terrain Preference */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Terrain Preference</label>
              <div style={{ ...inputWrap, position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3l4 8 5-5 5 15H2L8 3z"/>
                </svg>
                <select id="register-terrain" value={terrain}
                  onChange={(e) => setTerrain(e.target.value)} required
                  style={{
                    ...inputField, color: terrain ? '#fff' : '#555',
                    appearance: 'none', cursor: 'pointer',
                  }}>
                  <option value="" disabled style={{ background: '#111', color: '#555' }}>Select terrain...</option>
                  <option value="mountains" style={{ background: '#111', color: '#fff' }}>High Altitude Mountains</option>
                  <option value="valley" style={{ background: '#111', color: '#fff' }}>Kathmandu Valley</option>
                  <option value="offroad" style={{ background: '#111', color: '#fff' }}>Off-road Trails</option>
                  <option value="highway" style={{ background: '#111', color: '#fff' }}>Highways</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Submit */}
            <button id="register-submit" type="submit" disabled={isLoading} style={{
              width: '100%', padding: '15px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #fcab73, #e8732a)', color: '#000',
              fontSize: '0.9rem', fontWeight: '700', fontFamily: 'inherit',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 4px 24px rgba(232,115,42,0.25)',
              transition: 'all 0.25s ease',
            }}>
              {isLoading ? 'Processing...' : 'Join the Expedition'}
            </button>
          </form>

          {/* Login Link */}
          <p style={{
            textAlign: 'center', marginTop: '22px',
            color: '#666', fontSize: '0.8rem',
          }}>
            Already part of the tribe?{' '}
            <Link to="/auth/login" style={{
              color: '#e8732a', fontWeight: '700', textDecoration: 'underline',
              textUnderlineOffset: '3px', textDecorationColor: 'rgba(232,115,42,0.3)',
            }}>Back to Login</Link>
          </p>

          {/* Bottom Icons */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '18px',
            paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            {[
              { label: 'Delhi Fleet', color: '#e8732a' },
              { label: 'Global Access', color: '#7b81ff' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.6rem', color: '#555',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: item.color,
                }} />
                {item.label}
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center', marginTop: '12px',
            fontSize: '0.55rem', color: '#444',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
            </svg>
            24/7 Support
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '16px', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '24px',
          fontSize: '0.5rem', color: '#444', letterSpacing: '1.5px', fontWeight: '500',
        }}>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Sustainability</a>
        </div>
      </div>
    </div>
  );
}
