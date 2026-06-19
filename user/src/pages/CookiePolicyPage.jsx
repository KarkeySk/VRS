import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/common/LegalPage';

const liStyle = { marginBottom: '6px' };
const ulStyle = { margin: '8px 0', paddingLeft: '20px' };

const COOKIE_TYPES = [
  { name: 'Essential', purpose: 'Sign-in, security and core features. Always on — cannot be disabled.' },
  { name: 'Functional', purpose: 'Remember preferences such as theme and saved details.' },
  { name: 'Analytics', purpose: 'Measure usage so we can improve the platform.' },
  { name: 'Marketing', purpose: 'Personalized offers and campaign measurement.' },
];

export default function CookiePolicyPage() {
  const resetConsent = () => {
    localStorage.removeItem('bhatbhate-cookies-consent');
    window.location.reload();
  };

  return (
    <LegalPage
      title="Cookie Policy"
      updated="June 2026"
      intro="This policy explains how Bhatbhate uses cookies and similar technologies, and how you can control them."
    >
      <Section heading="1. What Are Cookies?">
        Cookies are small text files stored on your device when you visit a website. They help the site
        work properly, remember your choices, and understand how it is used.
      </Section>

      <Section heading="2. Types of Cookies We Use">
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' }}>
          {COOKIE_TYPES.map((type, i) => (
            <div
              key={type.name}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px',
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{type.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{type.purpose}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="3. Managing Your Preferences">
        When you first visit, a banner lets you <strong>Accept all</strong> or <strong>Reject</strong> non-essential
        cookies. You can change your decision at any time:
        <ul style={ulStyle}>
          <li style={liStyle}>Use the button below to reopen the consent banner.</li>
          <li style={liStyle}>Or clear cookies and site data through your browser settings.</li>
        </ul>
        <button
          type="button"
          onClick={resetConsent}
          style={{
            marginTop: '12px', padding: '10px 20px', borderRadius: '999px',
            background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
            border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Reset cookie preferences
        </button>
      </Section>

      <Section heading="4. Third-Party Cookies">
        Some features rely on third parties — for example, payments are handled by eSewa, which may set
        its own cookies during checkout. Those cookies are governed by the respective provider's policy.
      </Section>

      <Section heading="5. Changes to This Policy">
        We may update this Cookie Policy as our use of cookies evolves. The "Last updated" date above
        reflects the latest revision.
      </Section>

      <Section heading="6. Learn More">
        For how we handle personal data more broadly, see our{' '}
        <Link to="/privacy-policy" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>.
      </Section>
    </LegalPage>
  );
}
