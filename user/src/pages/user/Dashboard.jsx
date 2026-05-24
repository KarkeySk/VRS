import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, MapPin, Car, Calendar, UserRound } from 'lucide-react';
import WeatherPanel from '../../components/common/WeatherPanel';
import CalendarPanel from '../../components/common/CalendarPanel';

const quickActions = [
    {
        label: 'Pick Road Type',
        desc: 'Find vehicles tuned to your route — mountain, valley, off-road or highway.',
        image: 'https://images.unsplash.com/photo-1758701321116-985af34d993f?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/terrain',
        Icon: MapPin,
    },
    {
        label: 'Browse Fleet',
        desc: 'See every vehicle available — bikes, jeeps, SUVs and pickups.',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/vehicles',
        Icon: Car,
    },
    {
        label: 'My Bookings',
        desc: 'Track requests, payments and trip status in one place.',
        image: 'https://images.unsplash.com/photo-1643083945816-d7265247256f?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/bookings',
        Icon: Calendar,
    },
    {
        label: 'Profile',
        desc: 'Update contact details, documents and preferences.',
        image: 'https://images.unsplash.com/photo-1668071484590-faf28e5ed5a4?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/profile',
        Icon: UserRound,
    },
];

export default function Dashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const fullName = user?.user_metadata?.full_name?.trim() || '';
    const firstName = fullName ? fullName.split(' ')[0] : 'there';

    return (
        <div style={{ paddingTop: '84px', paddingBottom: '40px', minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <header style={{ marginBottom: '20px' }}>
                    <p style={{
                        color: 'var(--accent)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: 6,
                    }}>
                        Welcome back
                    </p>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                        lineHeight: 1.15,
                    }}>
                        Hello, {firstName}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Ready for your next trip?
                    </p>
                </header>

                <section
                    aria-label="Quick actions"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}
                >
                    {quickActions.map((action) => {
                        const overlay = isDark
                            ? 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.58) 50%, rgba(0,0,0,0.88) 100%)'
                            : 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.68) 100%)';
                        const Icon = action.Icon;
                        return (
                            <Link
                                key={action.label}
                                to={action.to}
                                className="dash-tile"
                                style={{
                                    textDecoration: 'none',
                                    background: 'var(--bg-card)',
                                    borderRadius: 20,
                                    border: isDark
                                        ? '1px solid rgba(255,255,255,0.07)'
                                        : '1px solid rgba(0,0,0,0.12)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: 252,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    transition: 'transform 0.22s, box-shadow 0.22s',
                                    isolation: 'isolate',
                                    boxShadow: isDark
                                        ? '0 4px 24px rgba(0,0,0,0.35)'
                                        : '0 4px 20px rgba(0,0,0,0.12)',
                                }}
                            >
                                <img
                                    src={action.image}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: isDark
                                            ? 'brightness(0.82) saturate(0.9)'
                                            : 'brightness(1.1) saturate(1.05)',
                                        transition: 'filter 0.4s ease',
                                    }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: overlay, zIndex: 1 }} />

                                {/* Top-left icon badge */}
                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        left: 16,
                                        zIndex: 2,
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        background: 'rgba(0,0,0,0.38)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        display: 'grid',
                                        placeItems: 'center',
                                        color: '#fff',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Icon size={17} />
                                </span>

                                {/* Top-right quick link badge */}
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        zIndex: 2,
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        background: 'rgba(0,0,0,0.38)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    Quick Link
                                </span>

                                {/* Bottom content */}
                                <div
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        width: '100%',
                                        padding: '14px 16px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <h2 style={{
                                        color: '#fff',
                                        fontSize: '1.15rem',
                                        fontWeight: 700,
                                        margin: 0,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                                    }}>
                                        {action.label}
                                    </h2>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.82)',
                                        fontSize: '0.82rem',
                                        lineHeight: 1.55,
                                        margin: 0,
                                        textShadow: '0 1px 6px rgba(0,0,0,0.45)',
                                    }}>
                                        {action.desc}
                                    </p>
                                    <span
                                        style={{
                                            marginTop: 10,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 7,
                                            color: '#fff',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            background: '#FF5723',
                                            borderRadius: 999,
                                            padding: '8px 16px',
                                            width: 'fit-content',
                                            boxShadow: '0 2px 12px rgba(255,87,35,0.45)',
                                        }}
                                    >
                                        Open <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </section>

                <section
                    aria-label="Suggestion"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(255,87,35,0.12) 0%, rgba(39,40,39,0.6) 100%)'
                            : 'linear-gradient(135deg, rgba(255,87,35,0.08) 0%, rgba(232,226,217,0.5) 100%)',
                        borderRadius: 16,
                        padding: '20px 24px',
                        border: isDark ? '1px solid rgba(255,87,35,0.18)' : '1px solid rgba(255,87,35,0.14)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                        marginBottom: 24,
                    }}
                >
                    <div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
                            Not sure which vehicle?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                            Choose your road type and we&apos;ll suggest a ride that fits.
                        </p>
                    </div>
                    <Link
                        to="/terrain"
                        style={{
                            textDecoration: 'none',
                            background: 'var(--brand-gradient)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            padding: '13px 26px',
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 6px 20px rgba(255,87,35,0.3)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Pick Road Type <ArrowRight size={15} />
                    </Link>
                </section>

                <section
                    aria-label="Trip planning panels"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}
                >
                    <WeatherPanel />
                    <CalendarPanel />
                </section>
            </div>
        </div>
    );
}
