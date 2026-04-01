import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { label: 'Expeditions', to: '/vehicles' },
        { label: 'Fleet', to: '/vehicles' },
        { label: 'Routes', to: '/bookings' },
        { label: 'Safety', to: '#' },
    ];

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, padding: '10px 20px' }}>
            <nav style={{
                background: 'rgba(8, 12, 18, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
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
                        alt="Bhatbhati"
                        style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 8px rgba(232, 115, 42, 0.3))',
                        }}
                    />
                    <span style={{
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        letterSpacing: '-0.01em',
                        background: 'linear-gradient(135deg, #fcc89b 0%, #e8732a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Bhatbhati
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
                                    color: isActive ? '#fff' : '#9ca3af',
                                    transition: 'color 0.25s',
                                    position: 'relative',
                                    paddingBottom: '2px',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseOut={(e) => e.currentTarget.style.color = isActive ? '#fff' : '#9ca3af'}
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
                                        background: 'linear-gradient(90deg, #fcab73, #e8732a)',
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* RIGHT SIDE — SEARCH + BOOK NOW */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '9px 16px',
                        transition: 'border-color 0.25s',
                    }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(232, 115, 42, 0.3)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                    >
                        <Search size={15} color="#777" strokeWidth={1.8} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="Search..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#fff',
                                fontSize: '0.8125rem',
                                width: '120px',
                            }}
                        />
                    </div>

                    {user ? (
                        <>
                            <Link to="/vehicles" style={{
                                textDecoration: 'none',
                                background: 'linear-gradient(135deg, #fcab73 0%, #e8732a 100%)',
                                color: '#000',
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
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '0.8125rem',
                                    padding: '10px 20px',
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.25s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(232, 115, 42, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
                            background: 'linear-gradient(135deg, #fcab73 0%, #e8732a 100%)',
                            color: '#000',
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
