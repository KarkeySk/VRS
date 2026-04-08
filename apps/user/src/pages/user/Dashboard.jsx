import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const name = user?.user_metadata?.full_name || 'Explorer';

    const quickActions = [
        { label: 'Choose Terrain', desc: 'Find vehicles suited to your route', image: '/images/hero-mountain.png', to: '/terrain', color: '#e8732a' },
        { label: 'Browse Fleet', desc: 'Explore all available vehicles', image: '/images/fleet-suv.png', to: '/vehicles', color: '#7b81ff' },
        { label: 'My Bookings', desc: 'View your booking history', image: '/images/vehicle-hilux.png', to: '/bookings', color: '#34d399' },
        { label: 'Profile', desc: 'Manage your account details', image: '/images/vehicle-scorpio.png', to: '/profile', color: '#f59e0b' },
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    {quickActions.map((action) => {
                        return (
                            <Link key={action.label} to={action.to} style={{
                                textDecoration: 'none', background: '#111', borderRadius: '20px', padding: '28px',
                                border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px',
                                transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = action.color + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: action.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', border: `1px solid ${action.color}40`,
                                }}>
                                    <img
                                        src={action.image}
                                        alt={action.label}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>{action.label}</h3>
                                    <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>{action.desc}</p>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: action.color, fontSize: '0.75rem', fontWeight: '600' }}>
                                    Get Started <ArrowRight size={14} />
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
