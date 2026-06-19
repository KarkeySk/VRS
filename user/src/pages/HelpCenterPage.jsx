import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/common/LegalPage';

const FAQS = [
  {
    q: 'How do I book a vehicle?',
    a: 'Pick your road type or browse vehicles, send an inquiry, then complete the booking application with your dates, drive type and documents. Once an admin approves it, you can pay to confirm.',
  },
  {
    q: 'Which documents do I need?',
    a: 'For most bookings you need a valid driving licence and a government-issued ID. You upload these during the booking application; they are stored securely and only accessed to verify your booking.',
  },
  {
    q: 'How do payments work?',
    a: 'After your booking is approved, pay securely through eSewa. We never store your eSewa credentials — only the transaction reference and status are kept against your booking.',
  },
  {
    q: 'Can I edit my booking?',
    a: 'Yes — you can edit a booking from the My Bookings page while it is still awaiting approval and unpaid. Once it is approved and paid, details are locked to protect your reservation.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Open My Bookings and use the Cancel option on a request that is still submitted or under review. For confirmed trips, contact support and we will assist you.',
  },
  {
    q: 'How do I get support?',
    a: 'Signed-in users can chat with our team using the support button in the bottom corner. You can also email us any time at support@bhatbhate.com.',
  },
];

export default function HelpCenterPage() {
  return (
    <LegalPage
      title="Help Center"
      intro="Answers to common questions about booking, payments and managing your trips. Can't find what you need? Reach us anytime."
    >
      <Section heading="Frequently Asked Questions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          {FAQS.map((item) => (
            <div
              key={item.q}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 18px',
              }}
            >
              <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                {item.q}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="Still need help?">
        Email our team at{' '}
        <a href="mailto:support@bhatbhate.com" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>support@bhatbhate.com</a>{' '}
        and we'll get back to you. For details on how we handle your data, see our{' '}
        <Link to="/privacy-policy" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>.
      </Section>
    </LegalPage>
  );
}
