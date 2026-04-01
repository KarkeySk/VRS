export default function HeroSection() {
  return (
    <section className="hero" id="hero">
      {/* Background Image */}
      <div className="hero-bg">
        <img
          src="/images/hero-mountain.png"
          alt="Dramatic Himalayan mountain peaks"
          loading="eager"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="hero-content">
          <span className="hero-label" id="hero-label">
            ◆ Expedition-Grade Vehicle Rental
          </span>

          <h1 className="hero-title" id="hero-title">
            ASCEND THE<br />
            <span className="highlight">UNKNOWN</span>.
          </h1>

          <p className="hero-description" id="hero-description">
            Conquer the most unforgiving terrain in Nepal with our 
            expedition-hardened fleet. Built to endure what the 
            Himalayas throw at you.
          </p>

          <div className="hero-cta" id="hero-cta">
            <a href="#fleet" className="btn btn-primary" id="hero-explore-btn">
              Explore Fleet
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#routes" className="btn btn-ghost" id="hero-routes-btn">
              View Routes
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator" id="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  )
}
