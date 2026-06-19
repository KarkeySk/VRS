import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';
import '../styles/CookiesConsent.css';

const CONSENT_KEY = 'bhatbhate-cookies-consent';

export default function CookiesConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY)) return;
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const persist = (accepted) => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: accepted,
        marketing: accepted,
        functional: accepted,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-head">
        <span className="cookie-banner-title">
          <Cookie size={16} aria-hidden="true" /> We use cookies
        </span>
        <button className="cookie-banner-close" onClick={() => persist(false)} aria-label="Reject non-essential cookies">
          <X size={16} />
        </button>
      </div>

      <p className="cookie-banner-text">
        We use cookies to improve your experience and analyze traffic. Read our{' '}
        <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
        <Link to="/cookie-policy">Cookie Policy</Link>.
      </p>

      <div className="cookie-banner-actions">
        <button className="ck-btn ck-ghost" onClick={() => persist(false)}>Reject</button>
        <button className="ck-btn ck-accept" onClick={() => persist(true)}>Accept all</button>
      </div>
    </div>
  );
}
