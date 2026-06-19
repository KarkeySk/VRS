import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <>
      <footer className="footer footer-pro" id="site-footer">
      <div className="container footer-pro-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" id="footer-logo">
            <img
              className="footer-logo-img rounded "
              src={logo}
              alt="Bhatbhati Travel & Fleet"
              
            />
            <span className="logo-dot"></span>
            Bhatbhate
          </Link>
          <p className="footer-tagline">
            Premium rides and scenic routes built for every journey.
          </p>
          <div className="footer-social">
            <a href="https://www.facebook.com" aria-label="Facebook" className="footer-social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                <path fill="currentColor" d="M13.5 9H15V6.5h-1.5C11.57 6.5 10.5 7.57 10.5 9.5V11H9v2.5h1.5V18H13v-4.5h1.8L15 11h-2V9.5c0-.28.22-.5.5-.5Z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://www.instagram.com" aria-label="Instagram" className="footer-social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                <path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5Zm6.25-2.75a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z" />
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn" className="footer-social-link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                <path fill="currentColor" d="M6.5 8.5H4V20h2.5ZM5.25 7.25A1.25 1.25 0 1 0 5.25 4.75a1.25 1.25 0 0 0 0 2.5ZM10 8.5H7.5V20H10v-6a2.5 2.5 0 0 1 5 0v6H17.5v-7a4.5 4.5 0 0 0-7.5-3.3Z" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <div className="footer-links" id="footer-links">
            <a href="#fleet">Fleet</a>
            <a href="#routes">Routes</a>
            <Link to="/vehicles">Vehicles</Link>
            <a href="#cta">Contact</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <div className="footer-links">
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/register">Register</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/privacy-policy">Terms & Privacy</Link>
          </div>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-contact-icon">
                <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <a href="mailto:support@bhatbhate.com">support@bhatbhate.com</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-contact-icon">
                <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <a href="tel:+977-98-XXXXXXX">+977 98X-XXXXXXX</a>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-contact-icon">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              Kathmandu, Nepal
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="footer-copy" id="footer-copy">
          © {new Date().getFullYear()} Bhatbhate | All rights reserved.
        </span>
      </div>
    </footer>
    </>
  )
}