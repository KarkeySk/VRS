import { useState, useEffect } from 'react';
import { Check, X, Cookie, SlidersHorizontal } from 'lucide-react';
import '../styles/CookiesConsent.css';

const CONSENT_KEY = 'bhatbhate-cookies-consent';

// Non-essential categories the visitor can opt in/out of. Essential cookies are
// always on and shown for transparency only.
const CATEGORIES = [
  {
    key: 'functional',
    badge: 'Functional',
    title: 'Functional',
    text: 'Remember preferences like theme, language and login status.',
  },
  {
    key: 'analytics',
    badge: 'Analytics',
    title: 'Analytics',
    text: 'Help us understand how the site is used so we can improve it.',
  },
  {
    key: 'marketing',
    badge: 'Marketing',
    title: 'Marketing',
    text: 'Allow personalized offers and measure campaign performance.',
  },
];

export default function CookiesConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  // Opt-in preferences (essential is always on and not stored here).
  const [prefs, setPrefs] = useState({ functional: true, analytics: true, marketing: true });

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) return;
    // Show shortly after first paint so the slide-up animation is visible.
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const persist = (consent) => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ essential: true, ...consent, timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const acceptAll = () => persist({ functional: true, analytics: true, marketing: true });
  const rejectAll = () => persist({ functional: false, analytics: false, marketing: false });
  const savePreferences = () => persist(prefs);
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  if (!isVisible) return null;

  return (
    <div className="cookies-consent-overlay" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cookies-consent-popup">
        <div className="cookies-header">
          <h3><Cookie size={20} aria-hidden="true" /> Cookie Preferences</h3>
          <button className="cookies-close-btn" onClick={rejectAll} aria-label="Reject non-essential cookies and close">
            <X size={20} />
          </button>
        </div>

        <div className="cookies-content">
          <p className="cookies-main-text">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize
            content. You can accept all, reject non-essential cookies, or choose your own preferences.
          </p>

          {showDetails && (
            <div className="cookies-categories">
              {/* Essential — always on, locked */}
              <div className="cookie-category">
                <div className="category-header">
                  <span className="category-badge essential">Essential</span>
                  <span className="category-description">Always on</span>
                </div>
                <p className="category-text">
                  Required for core functionality and security. These cannot be turned off.
                </p>
              </div>

              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="cookie-category">
                  <div className="category-header">
                    <span className={`category-badge ${cat.key}`}>{cat.badge}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[cat.key]}
                      aria-label={`Toggle ${cat.title} cookies`}
                      className={`cookie-switch ${prefs[cat.key] ? 'on' : ''}`}
                      onClick={() => toggle(cat.key)}
                    >
                      <span className="cookie-switch-knob" />
                    </button>
                  </div>
                  <p className="category-text">{cat.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="cookies-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <span className="divider">•</span>
            <a href="/cookie-policy">Cookie Policy</a>
          </div>
        </div>

        <div className="cookies-actions">
          <button className="cookies-btn reject-btn" onClick={rejectAll}>
            <X size={18} /> Reject All
          </button>
          {showDetails ? (
            <button className="cookies-btn customize-btn" onClick={savePreferences}>
              <Check size={16} /> Save Preferences
            </button>
          ) : (
            <button className="cookies-btn customize-btn" onClick={() => setShowDetails(true)}>
              <SlidersHorizontal size={16} /> Customize
            </button>
          )}
          <button className="cookies-btn accept-btn" onClick={acceptAll}>
            <Check size={18} /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
