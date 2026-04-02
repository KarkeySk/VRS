import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import landing from '../../assets/landing.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/vehicles');
    } catch (err) {
      setError(err.message || 'Failed to login');
      if (err.message === 'Supabase is not configured') {
        navigate('/vehicles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#080c12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={landing} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(232,115,42,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10, width: '420px', maxWidth: '90vw', height:"80vh",
        padding: '48px 40px',
        background: 'rgba(18,18,22,0.92)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src={logo} alt="Bhatbhati" style={{
            width: '52px', height: '52px', margin: '0 auto 14px', objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(232,115,42,0.35))',
          }} />
          <h2 style={{
            fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px',
            background: 'linear-gradient(135deg, #fcc89b, #e8732a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Bhatbhati</h2>
          <p style={{ color: '#555', fontSize: '0.6rem', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            The Ethereal Expedition
          </p>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ color: '#777', fontSize: '0.8rem' }}>Your next Himalayan ascent begins here.</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '10px 14px', marginBottom: '20px',
            color: '#ef4444', fontSize: '0.8rem', textAlign: 'center',
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '12px 14px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
              </svg>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@summit.com" required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Secret Key
              </label>
              <Link to="#" style={{ fontSize: '0.65rem', fontWeight: '700', color: '#e8732a', textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>
                Forgot?
              </Link>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '12px 14px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit', letterSpacing: '3px' }} />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '14px',
            background: 'linear-gradient(135deg, #fcab73, #e8732a)', color: '#000',
            fontSize: '0.875rem', fontWeight: '700', fontFamily: 'inherit',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(232,115,42,0.3)', transition: 'all 0.25s',
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
        <div style={{ position: 'relative', margin: '28px 0 20px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ position: 'relative', background: 'rgba(18,18,22,0.92)', padding: '0 14px', fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
            Social Verification
          </span>
        </div>

        {/* Social */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '11px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', color: '#bbb', fontSize: '0.8rem', fontWeight: '600',
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b81ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
            </svg>
            Biometric
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '11px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', color: '#bbb', fontSize: '0.8rem', fontWeight: '600',
            fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        {/* Register */}
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '0.8rem' }}>
          New to the summit?{' '}
          <Link to="/auth/register" style={{ color: '#e8732a', fontWeight: '600', textDecoration: 'none' }}>Request an Invite</Link>
        </p>
      </div>

      {/* Bottom Left Stats */}
      <div style={{ position: 'absolute', bottom: '36px', left: '36px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(17,17,17,0.75)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: '999px', padding: '8px 18px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(123,129,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b81ff" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.5rem', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Base Camp Temp</div>
            <div><span style={{ fontWeight: '800', color: '#fff', fontSize: '0.85rem' }}>-14°C</span> <span style={{ color: '#7b81ff', fontWeight: '600', fontSize: '0.7rem' }}>Everest</span></div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(17,17,17,0.75)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: '999px', padding: '8px 18px',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(232,115,42,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fcab74" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.5rem', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Active Expeditions</div>
            <div><span style={{ fontWeight: '800', color: '#fff', fontSize: '0.85rem' }}>42</span> <span style={{ color: '#fcab74', fontWeight: '600', fontSize: '0.7rem' }}>Teams</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '20px', left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 48px',
        fontSize: '0.5rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '500',
      }}>
        <span>© 2024 Bhatbhati Tours & Travel. The Ethereal Expedition.</span>
        <div style={{ display: 'flex', gap: '28px' }}>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Terms of Ascent</a>
          <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Safety Protocol</a>
        </div>
      </div>
    </div>
  );
}
