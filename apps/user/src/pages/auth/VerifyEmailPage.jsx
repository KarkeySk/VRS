import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function VerifyEmailPage() {
  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <img
          src="/images/fleet-suv.png"
          alt=""
          className="auth-visual-image"
          style={{ opacity: 1 }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-brand-row">
            <img src={logo} alt="Bhatbhate" className="auth-brand-logo brand-logo-circle" />
            <span>Bhatbhate</span>
          </div>
          <p className="auth-visual-kicker">Email Verification</p>
          <h2>Secure your account.</h2>
          <p>We are checking your verification link.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verify email</h1>
            <p>Please wait while we confirm your email address.</p>
          </div>

          <Link to="/auth/login" className="auth-submit">
            Go to Login <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
