import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            padding: '20px',
        }}>
            <div style={{
                fontSize: '7rem',
                fontWeight: '900',
                color: 'var(--accent)',
                lineHeight: 1,
                marginBottom: '16px',
            }}>
                404
            </div>
            <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
            }}>
                Page Not Found
            </h1>
            <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                maxWidth: '420px',
                lineHeight: 1.6,
                marginBottom: '36px',
            }}>
                The page you were looking for does not exist or has been moved.
            </p>
            <Link
                to="/"
                style={{
                    textDecoration: 'none',
                    background: 'var(--brand-gradient)',
                    color: 'var(--accent-ink)',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    padding: '14px 32px',
                    borderRadius: '999px',
                }}
            >
                Back to Home
            </Link>
        </div>
    );
}
