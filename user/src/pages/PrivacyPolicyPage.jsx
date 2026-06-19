import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/common/LegalPage';

const liStyle = { marginBottom: '6px' };
const ulStyle = { margin: '8px 0', paddingLeft: '20px' };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      intro="At Bhatbhate, we respect your privacy. This policy explains what information we collect when you use our vehicle rental platform, how we use it, and the choices you have."
    >
      <Section heading="1. Information We Collect">
        We collect information you provide and information generated as you use the platform:
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Account details</strong> — name, email, phone number and profile information.</li>
          <li style={liStyle}><strong>Booking details</strong> — vehicles, dates, drive type, trip questionnaire and add-ons.</li>
          <li style={liStyle}><strong>Verification documents</strong> — driving licence and ID uploaded to complete a booking, stored securely in a private bucket.</li>
          <li style={liStyle}><strong>Payment data</strong> — payments are processed by eSewa; we store only the transaction reference and status, never your eSewa credentials or card details.</li>
          <li style={liStyle}><strong>Usage data</strong> — pages visited and actions taken, used to keep the service reliable and improve it.</li>
        </ul>
      </Section>

      <Section heading="2. How We Use Your Information">
        <ul style={ulStyle}>
          <li style={liStyle}>To create your account and process bookings and payments.</li>
          <li style={liStyle}>To verify eligibility to rent (licence and ID checks).</li>
          <li style={liStyle}>To send booking confirmations, updates and support replies.</li>
          <li style={liStyle}>To maintain security and prevent fraud or misuse.</li>
          <li style={liStyle}>To analyze and improve the platform, where you have consented.</li>
        </ul>
      </Section>

      <Section heading="3. Cookies & Tracking">
        We use cookies and similar technologies to keep you signed in, remember preferences and
        understand usage. You can accept or reject non-essential cookies at any time. See our{' '}
        <Link to="/cookie-policy" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Cookie Policy</Link>{' '}
        for details.
      </Section>

      <Section heading="4. How We Share Information">
        We do not sell your personal information. We share data only with:
        <ul style={ulStyle}>
          <li style={liStyle}><strong>eSewa</strong>, to process your payments.</li>
          <li style={liStyle}><strong>Service providers</strong> (e.g. hosting and database) that operate the platform on our behalf.</li>
          <li style={liStyle}><strong>Authorities</strong>, where required by law or to protect our users and service.</li>
        </ul>
      </Section>

      <Section heading="5. Data Security">
        Data is transmitted over encrypted connections and access is restricted. Uploaded documents are
        kept in a private storage bucket accessible only through short-lived, signed links. No system is
        perfectly secure, but we work continuously to protect your information.
      </Section>

      <Section heading="6. Data Retention">
        We keep your information for as long as your account is active or as needed to provide the
        service and meet legal obligations. Completed and cancelled bookings may be removed during
        periodic cleanups once they are no longer required.
      </Section>

      <Section heading="7. Your Rights">
        You may access, correct or delete your personal information, and withdraw consent for
        non-essential cookies at any time. To make a request, contact us using the details below.
      </Section>

      <Section heading="8. Changes to This Policy">
        We may update this policy from time to time. Material changes will be reflected by the
        "Last updated" date at the top of this page.
      </Section>

      <Section heading="9. Contact Us">
        Questions about your privacy? Email us at{' '}
        <a href="mailto:support@bhatbhate.com" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>support@bhatbhate.com</a>.
      </Section>
    </LegalPage>
  );
}
