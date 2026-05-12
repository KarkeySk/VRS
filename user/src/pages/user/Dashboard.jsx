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
        // Dark mode: moody dawn-lit road
        imageDark: 'https://images.unsplash.com/photo-1758701321116-985af34d993f?w=1400&h=1000&auto=format&fit=crop&q=80',
        // Light mode: bright, airy mountain road
        imageLight: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/terrain',
        accent: '#e8732a',
        accentLight: '#c1662c',
        Icon: MapPin,
    },
    {
        label: 'Browse Fleet',
        desc: 'See every vehicle available — bikes, jeeps, SUVs and pickups.',
        imageDark: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&h=1000&auto=format&fit=crop&q=80',
        imageLight: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/vehicles',
        accent: '#7b81ff',
        accentLight: '#4a66c4',
        Icon: Car,
    },
    {
        label: 'My Bookings',
        desc: 'Track requests, payments and trip status in one place.',
        imageDark: 'https://images.unsplash.com/photo-1643083945816-d7265247256f?w=1400&h=1000&auto=format&fit=crop&q=80',
        imageLight: 'https://images.unsplash.com/photo-1454179083322-198bb4daae41?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/bookings',
        accent: '#34d399',
        accentLight: '#1f8d63',
        Icon: Calendar,
    },
    {
        label: 'Profile',
        desc: 'Update contact details, documents and preferences.',
        imageDark: 'https://images.unsplash.com/photo-1668071484590-faf28e5ed5a4?w=1400&h=1000&auto=format&fit=crop&q=80',
        imageLight: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1400&h=1000&auto=format&fit=crop&q=80',
        to: '/profile',
        accent: '#f59e0b',
        accentLight: '#b45309',
        Icon: UserRound,
    },
];

export default function Dashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const fullName = user?.user_metadata?.full_name?.trim() || '';
    const firstName = fullName ? fullName.split(' ')[0] : 'there';

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <header style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
                    <p style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 12 }}>
                        Welcome back
                    </p>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Hello, {firstName}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Ready for your next trip?</p>
                </header>

                <section
                    aria-label="Quick actions"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 60 }}
                >
                    {quickActions.map((action) => {
                        const accent = isDark ? action.accent : action.accentLight;
                        const image = isDark ? action.imageDark : action.imageLight;
                        // Light mode uses a softer, warmer overlay so the image actually shows through;
                        // dark mode keeps the deep gradient for legibility on dark cards.
                        const overlay = isDark
                            ? 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(8,8,8,0.74) 58%, rgba(8,8,8,0.95) 100%)'
                            : 'linear-gradient(180deg, rgba(255,253,248,0.0) 0%, rgba(33,45,58,0.45) 60%, rgba(33,45,58,0.82) 100%)';
                        const Icon = action.Icon;
                        return (
                            <Link
                                key={action.label}
                                to={action.to}
                                className="dash-tile"
                                style={{
                                    '--tile-accent': accent,
                                    textDecoration: 'none',
                                    background: 'var(--bg-card)',
                                    borderRadius: 22,
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: 280,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                                    isolation: 'isolate',
                                }}
                            >
                                <img
                                    src={image}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        // In light mode lift the image a notch so it doesn't feel washed out
                                        filter: isDark ? 'none' : 'saturate(1.05) contrast(1.02)',
                                    }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: overlay, zIndex: 1 }} />
                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        left: 14,
                                        zIndex: 2,
                                        width: 36,
                                        height: 36,
                                        borderRadius: 12,
                                        background: `${accent}33`,
                                        border: `1px solid ${accent}77`,
                                        display: 'grid',
                                        placeItems: 'center',
                                        color: '#fff',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    <Icon size={16} />
                                </span>
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        right: 14,
                                        zIndex: 2,
                                        padding: '5px 10px',
                                        borderRadius: 999,
                                        background: 'rgba(0,0,0,0.4)',
                                        border: `1px solid ${accent}66`,
                                        color: '#fff',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    Quick Link
                                </span>
                                <div
                                    style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        width: '100%',
                                        padding: 22,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                    }}
                                >
                                    <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                                        {action.label}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.86)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                                        {action.desc}
                                    </p>
                                    <span
                                        style={{
                                            marginTop: 8,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            color: '#fff',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            background: `${accent}b3`,
                                            border: `1px solid ${accent}`,
                                            borderRadius: 999,
                                            padding: '8px 14px',
                                            width: 'fit-content',
                                        }}
                                    >
                                        Open <ArrowRight size={15} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </section>

                <section
                    aria-label="Suggestion"
                    style={{
                        background: 'var(--brand-soft-gradient)',
                        borderRadius: 24,
                        padding: 'clamp(24px, 5vw, 40px)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 20,
                        marginBottom: 60,
                    }}
                >
                    <div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
                            Not sure which vehicle?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            Choose your road type and we&apos;ll suggest a ride that fits.
                        </p>
                    </div>
                    <Link
                        to="/terrain"
                        style={{
                            textDecoration: 'none',
                            background: 'var(--brand-gradient)',
                            color: 'var(--accent-ink)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            padding: '14px 28px',
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 8px 24px var(--accent-glow)',
                        }}
                    >
                        Pick Road Type <ArrowRight size={16} />
                    </Link>
                </section>

                <section
                    aria-label="Trip planning panels"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 60 }}
                >
                    <WeatherPanel />
                    <CalendarPanel />
                </section>
            </div>
        </div>
    );
}
