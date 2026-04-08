import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const name = user?.user_metadata?.full_name || 'Explorer';

    const quickActions = [
        {
            label: 'Choose Terrain',
            desc: 'Find vehicles suited to your route',
            image: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=900&fit=crop',
            to: '/terrain',
            color: '#e8732a',
        },
        {
            label: 'Browse Fleet',
            desc: 'Explore all available vehicles',
            image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=900&fit=crop',
            to: '/vehicles',
            color: '#7b81ff',
        },
        {
            label: 'My Bookings',
            desc: 'View your booking history',
            image: 'https://images.unsplash.com/photo-1506784693919-ef06d93c28d2?w=1200&h=900&fit=crop',
            to: '/bookings',
            color: '#34d399',
        },
        {
            label: 'Profile',
            desc: 'Manage your account details',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=900&fit=crop',
            to: '/profile',
            color: '#f59e0b',
        },
    ];

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <div style={{ marginBottom: '48px' }}>
                    <p style={{ color: '#e8732a', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>WELCOME BACK</p>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                        Hello, {name}
                    </h1>
                    <p style={{ color: '#666', fontSize: '1rem' }}>Ready for your next expedition?</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    {quickActions.map((action) => {
                        return (
                            <Link key={action.label} to={action.to} style={{
                                textDecoration: 'none',
                                background: '#111',
                                borderRadius: '22px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '300px',
                                display: 'flex',
                                alignItems: 'flex-end',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = action.color + '70';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 16px 30px ${action.color}33`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                                <img
                                    src={action.image}
                                    alt={action.label}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: 'scale(1.02)',
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(8,8,8,0.78) 58%, rgba(8,8,8,0.96) 100%)`,
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    padding: '5px 10px',
                                    borderRadius: '999px',
                                    background: `${action.color}2b`,
                                    border: `1px solid ${action.color}66`,
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.8px',
                                    textTransform: 'uppercase',
                                }}>
                                    Quick Action
                                </div>
                                <div style={{
                                    position: 'relative',
                                    zIndex: 2,
                                    width: '100%',
                                    padding: '22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{action.label}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{action.desc}</p>
                                    <div style={{
                                        marginTop: '8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: action.color,
                                        fontSize: '0.78rem',
                                        fontWeight: '700',
                                        background: 'rgba(0,0,0,0.35)',
                                        border: `1px solid ${action.color}4f`,
                                        borderRadius: '999px',
                                        padding: '8px 12px',
                                        width: 'fit-content',
                                    }}>
                                        Get Started <ArrowRight size={15} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(232,115,42,0.08), rgba(123,129,255,0.05))',
                    borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
                }}>
                    <div>
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Not sure which vehicle?</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Tell us your terrain and we'll recommend the perfect ride.</p>
                    </div>
                    <Link to="/terrain" style={{
                        textDecoration: 'none', background: 'linear-gradient(135deg, #fcab73, #e8732a)',
                        color: '#000', fontWeight: '700', fontSize: '0.85rem', padding: '14px 28px',
                        borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        Choose Terrain <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
