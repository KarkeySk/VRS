import { Link, useLocation } from 'react-router-dom';
import { Bell, UserCircle } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();

    return (
        <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <nav style={{ pointerEvents: 'auto', background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', width: '90%', maxWidth: '1000px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' }}>
                {/* BRAND */}
                <Link to="/vehicles" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fabe85 0%, #e8732a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '800', fontSize: '0.9rem' }}>
                        B
                    </div>
                    <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>Bhatbhati</span>
                </Link>

                {/* NAV LINKS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '0.875rem', fontWeight: '500' }}>
                    <Link to="/vehicles" style={{ textDecoration: 'none', color: location.pathname === '/vehicles' ? 'var(--accent)' : '#a0a0a0', transition: 'color 0.2s' }}>Explore</Link>
                    <Link to="#" style={{ textDecoration: 'none', color: '#a0a0a0', transition: 'color 0.2s' }}>Tours</Link>
                    <Link to="#" style={{ textDecoration: 'none', color: '#a0a0a0', transition: 'color 0.2s' }}>Weather</Link>
                    <Link to="/profile" style={{ textDecoration: 'none', color: location.pathname === '/profile' ? 'var(--accent)' : '#a0a0a0', transition: 'color 0.2s' }}>Profile</Link>
                </div>

                {/* USER ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#a0a0a0' }}>
                    <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>
                        <Bell size={20} strokeWidth={1.5} />
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#a0a0a0'}>
                        <UserCircle size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </nav>
        </div>
    );
}
