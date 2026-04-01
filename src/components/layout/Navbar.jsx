import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="container">
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <span className="logo-dot"></span>
            Bhatbhatify
          </Link>

          <div className="navbar-links" id="navbar-links">
            <a href="#hero" className="active">Home</a>
            <a href="#fleet">Fleet</a>
            <a href="#routes">Routes</a>
            <a href="#cta">About</a>
          </div>

          <div className="navbar-actions">
            <Link to="/auth/login" className="btn btn-outline navbar-btn-book" id="navbar-login-btn">
              Log In
            </Link>
            <Link to="/vehicles" className="btn btn-primary navbar-btn-book" id="navbar-book-btn">
              Book Now
            </Link>
            <button className="mobile-menu-btn" onClick={toggleMobile} id="mobile-menu-toggle" aria-label="Toggle mobile menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobile-nav">
        <button className="mobile-nav-close" onClick={closeMobile} aria-label="Close menu">×</button>
        <a href="#hero" onClick={closeMobile}>Home</a>
        <a href="#fleet" onClick={closeMobile}>Fleet</a>
        <a href="#routes" onClick={closeMobile}>Routes</a>
        <a href="#cta" onClick={closeMobile}>About</a>
        <Link to="/auth/login" className="btn btn-outline" onClick={closeMobile}>Log In</Link>
        <Link to="/vehicles" className="btn btn-primary" onClick={closeMobile}>Book Now</Link>
      </div>
    </>
  )
}
