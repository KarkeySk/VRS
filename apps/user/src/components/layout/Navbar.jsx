import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const navLinks = [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Terrain', to: '/terrain' },
        { label: 'Fleet', to: '/vehicles' },
        { label: 'Bookings', to: '/bookings' },
    ];

    if (location.pathname.startsWith('/auth/')) {
        return null;
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, padding: '10px 20px' }}>
            <nav style={{
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border)',
                borderRadius: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 48px',
            }}>
                {/* BRAND — Logo + Name */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img
                        src={logo}
                        alt="Bhatbhate"
                        className="brand-logo-circle"
                        style={{
                            width: '42px',
                            height: '42px',
                            filter: 'drop-shadow(0 0 8px rgba(232, 115, 42, 0.3))',
                        }}
                    />
                    <span style={{
                        color: 'var(--text-primary)',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        letterSpacing: '-0.01em',
                        background: 'var(--brand-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Bhatbhate
                    </span>
                </Link>

                {/* NAV LINKS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', fontSize: '0.875rem', fontWeight: '500' }}>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.label}
                                to={link.to}
                                style={{
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    transition: 'color 0.25s',
                                    position: 'relative',
                                    paddingBottom: '2px',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)'}
                            >
                                {link.label}
                                {isActive && (
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: '20%',
                                        right: '20%',
                                        height: '2px',
                                        borderRadius: '2px',
                                        background: 'var(--brand-gradient)',
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* RIGHT SIDE — TOGGLES + BOOK NOW */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '38px',
                            height: '38px',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            borderRadius: '999px',
                            cursor: 'pointer',
                        }}
                    >
                        {isDark ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    {user ? (
                        <>
                            <Link to="/terrain" style={{
                                textDecoration: 'none',
                                background: 'var(--brand-gradient)',
                                color: 'var(--accent-ink)',
                                fontWeight: '700',
                                fontSize: '0.8125rem',
                                padding: '10px 22px',
                                borderRadius: '999px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(232, 115, 42, 0.25)',
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 115, 42, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 115, 42, 0.25)';
                                }}
                            >
                                Book Now
                            </Link>
                            <button
                                onClick={() => { signOut(); navigate('/'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    fontSize: '0.8125rem',
                                    padding: '10px 20px',
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.25s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(232, 115, 42, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/auth/login" style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--brand-gradient)',
                            color: 'var(--accent-ink)',
                            fontWeight: '700',
                            fontSize: '0.8125rem',
                            padding: '10px 22px',
                            borderRadius: '999px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 15px rgba(232, 115, 42, 0.25)',
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 115, 42, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 115, 42, 0.25)';
                            }}
                        >
                            <LogIn size={14} /> Login
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
