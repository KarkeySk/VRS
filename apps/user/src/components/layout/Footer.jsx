import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <Link to="/" className="footer-logo" id="footer-logo">
          <span className="logo-dot"></span>
          Bhatbhatify
        </Link>  

        <div className="footer-links" id="footer-links">
          <a href="#fleet">Fleet</a>
          <a href="#routes">Routes</a>
          <Link to="/vehicles">Vehicles</Link>
          <a href="#cta">Contact</a>
        </div>

        <span className="footer-copy" id="footer-copy">
          © {new Date().getFullYear()} Bhatbhatify | All rights reserved.
        </span>
      </div>
    </footer>
  )
}
