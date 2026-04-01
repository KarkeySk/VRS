import { useRef } from 'react'

export default function HeroSection() {
  const bgRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!bgRef.current) return
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window

    // Calculate mouse position as -1 to 1 range
    const xPercent = (clientX / innerWidth - 0.5) * 2
    const yPercent = (clientY / innerHeight - 0.5) * 2

    // Apply 3D transform — tilt + translate for parallax depth
    const rotateY = xPercent * 5     // max 5deg tilt X
    const rotateX = -yPercent * 3    // max 3deg tilt Y
    const translateX = xPercent * -20 // subtle shift
    const translateY = yPercent * -15

    bgRef.current.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) scale(1.1)`
  }

  const handleMouseLeave = () => {
    if (!bgRef.current) return
    // Smoothly reset back to center
    bgRef.current.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1.1)'
  }

  return (
    <section
      className="hero"
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Background Image */}
      <div className="hero-bg">
        <img
          ref={bgRef}
          src="/images/hero-mountain.png"
          alt="Dramatic Himalayan mountain peaks"
          loading="eager"
          style={{
            transition: 'transform 0.15s ease-out',
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
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
            <span className="highlight">UNKNOWN</span>
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
                <path d="M5 12h14M12 5l7 7-7 7" />
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
