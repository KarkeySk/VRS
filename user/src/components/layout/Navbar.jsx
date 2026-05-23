import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogIn, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getFriendlyAuthError } from '@bhatbhati/shared/utils/authFeedback.js';
import logo from '../../assets/logo.png';
import NotificationBell from '../common/NotificationBell';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Terrain', to: '/terrain' },
        { label: 'Fleet', to: '/vehicles' },
        { label: 'Bookings', to: '/bookings' },
        { label: 'Profile', to: '/profile' },
    ];

    if (location.pathname.startsWith('/auth/')) {
        return null;
    }

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = async () => {
        setLogoutError('');
        setIsSigningOut(true);
        try {
            await signOut();
            navigate('/');
        } catch (err) {
            setLogoutError(getFriendlyAuthError(err, 'We could not sign you out. Please try again.'));
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <>
        <style>{`
            @media (max-width: 768px) {
                .nav-desktop-links { display: none !important; }
                .nav-desktop-actions { display: none !important; }
                .nav-hamburger { display: flex !important; }
            }
            @media (min-width: 769px) {
                .nav-hamburger { display: none !important; }
                .nav-mobile-overlay { display: none !important; }
            }
        `}</style>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '10px 20px' }}>
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

                {/* NAV LINKS — hidden on mobile */}
                <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '40px', fontSize: '0.875rem', fontWeight: '500' }}>
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

                {/* RIGHT SIDE — TOGGLES + BOOK NOW — hidden on mobile */}
                <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

                    {user && <NotificationBell />}

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
                                onClick={handleLogout}
                                disabled={isSigningOut}
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
                                    cursor: isSigningOut ? 'not-allowed' : 'pointer',
                                    opacity: isSigningOut ? 0.7 : 1,
                                    transition: 'border-color 0.25s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(232, 115, 42, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <LogOut size={14} /> {isSigningOut ? 'Signing out...' : 'Logout'}
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

                {/* HAMBURGER — visible only on mobile */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                    }}
                >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* MOBILE MENU OVERLAY */}
            {menuOpen && (
                <div
                    className="nav-mobile-overlay"
                    style={{
                        marginTop: '8px',
                        background: 'var(--nav-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                    }}
                >
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.label}
                                to={link.to}
                                onClick={closeMenu}
                                style={{
                                    textDecoration: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? '700' : '500',
                                    fontSize: '0.9rem',
                                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                                    display: 'block',
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => { toggleTheme(); closeMenu(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '999px',
                                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                            }}
                        >
                            {isDark ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
                        </button>
                        {user ? (
                            <>
                                <Link to="/terrain" onClick={closeMenu} style={{
                                    textDecoration: 'none', background: 'var(--brand-gradient)',
                                    color: 'var(--accent-ink)', fontWeight: '700', fontSize: '0.8rem',
                                    padding: '10px 18px', borderRadius: '999px',
                                }}>
                                    Book Now
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); closeMenu(); }}
                                    disabled={isSigningOut}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                        color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem',
                                        padding: '10px 16px', borderRadius: '999px', cursor: 'pointer',
                                    }}
                                >
                                    <LogOut size={14} /> {isSigningOut ? 'Signing out...' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <Link to="/auth/login" onClick={closeMenu} style={{
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                                fontWeight: '700', fontSize: '0.8rem', padding: '10px 18px', borderRadius: '999px',
                            }}>
                                <LogIn size={14} /> Login
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {logoutError && (
                <div style={{
                    maxWidth: '420px',
                    margin: '8px auto 0',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.12)',
                    color: '#f87171',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(12px)',
                }}>
                    {logoutError}
                </div>
            )}
        </div>
        </>
    );
}
