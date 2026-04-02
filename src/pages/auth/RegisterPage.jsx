import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export default function RegisterPage() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terrain, setTerrain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signUp(email, password, { full_name: fullname, terrain_preference: terrain });
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
      if (err.message === 'Supabase is not configured') {
        navigate('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrap = {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '12px 14px',
  };

  const inputField = {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit',
  };

  const label = {
    display: 'block', fontSize: '0.6rem', fontWeight: '700', color: '#777',
    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px',
  };

  // Photo collage images
  const photos = [
    '/images/hero-mountain.png',
    '/images/route-annapurna.png',
    '/images/vehicle-hilux.png',
    '/images/route-mustang.png',
    '/images/vehicle-scorpio.png',
  ];

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Photo Collage Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '6px', padding: '6px', opacity: 0.4 }}>
        {/* Left column - 2 rows */}
        <div style={{ gridRow: '1 / 2', overflow: 'hidden', borderRadius: '12px' }}>
          <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ gridRow: '1 / 2', overflow: 'hidden', borderRadius: '12px' }}>
          {/* Center top - empty, form goes here */}
        </div>
        <div style={{ gridRow: '1 / 2', overflow: 'hidden', borderRadius: '12px' }}>
          <img src={photos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ gridRow: '2 / 3', overflow: 'hidden', borderRadius: '12px' }}>
          <img src={photos[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ gridRow: '2 / 3', overflow: 'hidden', borderRadius: '12px' }}>
          {/* Center bottom - empty */}
        </div>
        <div style={{ gridRow: '2 / 3', overflow: 'hidden', borderRadius: '12px' }}>
          <img src={photos[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(10,10,10,0.55)' }} />

      {/* Form Card */}
      <div style={{
        position: 'relative', zIndex: 10, width: '420px', maxWidth: '90vw',
        padding: '36px 36px 32px',
        background: 'rgba(18,18,22,0.92)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src={logo} alt="Bhatbhati" style={{
            width: '44px', height: '44px', margin: '0 auto 10px', objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(232,115,42,0.3))',
          }} />
          <h1 style={{
            fontSize: '1.1rem', fontWeight: '800', color: '#ffd2b6',
            letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '2px',
          }}>Bhatbhatify</h1>
          <p style={{ color: '#555', fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
            The Ethereal Expedition
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '10px 14px', marginBottom: '16px',
            color: '#ef4444', fontSize: '0.8rem', textAlign: 'center',
          }}>{error}</div>
        )}

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Full Name</label>
            <div style={inputWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)}
                placeholder="John Doe" required style={inputField} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Email Address</label>
            <div style={inputWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@horizon.com" required style={inputField} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Password</label>
            <div style={inputWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required style={{ ...inputField, letterSpacing: '3px' }} />
            </div>
          </div>

          {/* Terrain */}
          <div style={{ marginBottom: '24px' }}>
            <label style={label}>Terrain Preference</label>
            <div style={{ ...inputWrap, position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3l4 8 5-5 5 15H2L8 3z"/>
              </svg>
              <select value={terrain} onChange={(e) => setTerrain(e.target.value)} required
                style={{ ...inputField, color: terrain ? '#fff' : '#555', appearance: 'none', cursor: 'pointer' }}>
                <option value="" disabled style={{ background: '#111', color: '#555' }}>Select your territory</option>
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
          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '14px',
            background: 'linear-gradient(135deg, #fcab73, #e8732a)', color: '#000',
            fontSize: '0.875rem', fontWeight: '700', fontFamily: 'inherit',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(232,115,42,0.3)', transition: 'all 0.25s',
          }}>
            {isLoading ? 'Processing...' : 'Join the Expedition'}
          </button>
        </form>

        {/* Login Link */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.8rem' }}>
          Already a member?{' '}
          <Link to="/auth/login" style={{ color: '#e8732a', fontWeight: '700', textDecoration: 'none' }}>Back to Login</Link>
        </p>

        {/* Bottom Icons */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px',
          paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {[
            'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
          ].map((d, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d}/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '16px', left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
        fontSize: '0.5rem', color: '#444', letterSpacing: '1.5px', fontWeight: '500',
      }}>
        <span>© 2024 Himalayan Horizon. The Ethereal Expedition.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Sustainability</a>
        </div>
      </div>
    </div>
  );
}
