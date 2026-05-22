import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import '../styles/CookiesConsent.css';

export default function CookiesConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('bhatbhate-cookies-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('bhatbhate-cookies-consent', JSON.stringify({
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('bhatbhate-cookies-consent', JSON.stringify({
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleCustomize = () => {
    window.location.href = '/privacy-policy#cookie-settings';
  };

  if (!isVisible) return null;

  return (
    <div className="cookies-consent-overlay">
      <div className="cookies-consent-popup">
        <div className="cookies-header">
          <h3>🍪 Cookie Preferences</h3>
          <button
            className="cookies-close-btn"
            onClick={handleRejectAll}
            aria-label="Close cookie consent"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cookies-content">
          <p className="cookies-main-text">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
            By clicking "Accept All", you consent to our use of cookies.
          </p>

          <div className="cookies-categories">
            <div className="cookie-category">
              <div className="category-header">
                <span className="category-badge essential">Essential</span>
                <span className="category-description">Always active</span>
              </div>
              <p className="category-text">
                Required for basic site functionality and security. Cannot be disabled.
              </p>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <span className="category-badge functional">Functional</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="category-toggle"
                  disabled
                  title="Functional cookies are required"
                />
              </div>
              <p className="category-text">
                Enable enhanced features like remembering preferences and login status.
              </p>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <span className="category-badge analytics">Analytics</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="category-toggle"
                  id="analytics-toggle"
                />
              </div>
              <p className="category-text">
                Help us understand how you use our site to improve user experience.
              </p>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <span className="category-badge marketing">Marketing</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="category-toggle"
                  id="marketing-toggle"
                />
              </div>
              <p className="category-text">
                Used for personalized advertisements and marketing campaigns.
              </p>
            </div>
          </div>

          <div className="cookies-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <span className="divider">•</span>
            <a href="/cookie-policy">Cookie Policy</a>
          </div>
        </div>

        <div className="cookies-actions">
          <button
            className="cookies-btn reject-btn"
            onClick={handleRejectAll}
          >
            <X size={18} />
            Reject All
          </button>
          <button
            className="cookies-btn customize-btn"
            onClick={handleCustomize}
          >
            Customize
          </button>
          <button
            className="cookies-btn accept-btn"
            onClick={handleAcceptAll}
          >
            <Check size={18} />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
