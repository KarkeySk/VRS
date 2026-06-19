import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../layout/Footer';

/** Shared layout for legal/policy pages (Privacy, Cookies). */
export default function LegalPage({ title, intro, updated, children }) {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '110px 20px 64px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-secondary)', textDecoration: 'none',
            fontSize: '0.82rem', fontWeight: 600, marginBottom: '28px',
          }}
        >
          <ArrowLeft size={15} /> Back to home
        </Link>

        <h1 style={{
          color: 'var(--text-primary)', fontSize: '2.2rem', fontWeight: 800,
          letterSpacing: '-0.01em', marginBottom: '12px',
        }}>
          {title}
        </h1>

        {intro && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '8px' }}>
            {intro}
          </p>
        )}

        {updated && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '36px' }}>
            Last updated: {updated}
          </p>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/** A titled section within a legal page. */
export function Section({ heading, children }) {
  return (
    <section style={{ marginTop: '32px' }}>
      <h2 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>
        {heading}
      </h2>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}
