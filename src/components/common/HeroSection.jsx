import { useRef, useCallback, useEffect } from 'react'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const contentRef = useRef(null)
  const overlayRef = useRef(null)
  const animFrame = useRef(null)

  // Current and target values for smooth lerping
  const current = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  const lerp = (start, end, factor) => start + (end - start) * factor

  // Smooth animation loop — runs independently of mouse events
  useEffect(() => {
    const animate = () => {
      // Lerp toward target (0.06 = buttery smooth)
      current.current.x = lerp(current.current.x, target.current.x, 0.06)
      current.current.y = lerp(current.current.y, target.current.y, 0.06)

      const x = current.current.x
      const y = current.current.y

      if (bgRef.current) {
        // Background: tilt + shift + subtle scale for depth
        const bgRotateY = x * 15
        const bgRotateX = -y * 10
        const bgTranslateX = x * -50
        const bgTranslateY = y * -35
        bgRef.current.style.transform =
          `perspective(800px) rotateX(${bgRotateX}deg) rotateY(${bgRotateY}deg) translate3d(${bgTranslateX}px, ${bgTranslateY}px, 0) scale(1.2)`
      }

      if (contentRef.current) {
        // Content: moves slightly opposite for depth separation
        const cTranslateX = x * 20
        const cTranslateY = y * 14
        contentRef.current.style.transform =
          `translate3d(${cTranslateX}px, ${cTranslateY}px, 0)`
      }

      if (overlayRef.current) {
        // Overlay: subtle gradient shift for lighting effect
        const lightX = 50 + x * 15
        const lightY = 40 + y * 15
        overlayRef.current.style.background =
          `radial-gradient(ellipse at ${lightX}% ${lightY}%, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,1) 100%)`
      }

      animFrame.current = requestAnimationFrame(animate)
    }

    animFrame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame.current)
  }, [])

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return

    // Normalize mouse position to -1 to 1 relative to the hero section
    target.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    target.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Smoothly drift back to center
    target.current.x = 0
    target.current.y = 0
  }, [])

  return (
    <section
      className="hero"
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Background Image */}
      <div className="hero-bg" style={{ overflow: 'hidden' }}>
        <img
          ref={bgRef}
          src="/images/hero-mountain.png"
          alt="Dramatic Himalayan mountain peaks"
          loading="eager"
          style={{
            willChange: 'transform',
            transformOrigin: 'center center',
            transform: 'perspective(800px) scale(1.2)',
          }}
        />
        <div
          ref={overlayRef}
          className="hero-overlay"
          style={{ willChange: 'background' }}
        ></div>
      </div>

      {/* Content with reverse parallax */}
      <div className="container">
        <div
          className="hero-content"
          ref={contentRef}
          style={{ willChange: 'transform' }}
        >
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
