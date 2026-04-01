import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.2 }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="cta" id="cta" ref={sectionRef}>
      <div className="container">
        <h2 className="cta-title reveal" id="cta-title">
          READY TO<br />BREAK GROUND?
        </h2>
        <div className="cta-buttons reveal">
          <Link to="/vehicles" className="btn btn-primary" id="cta-explore-btn">
            Explore Vehicles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a href="#fleet" className="btn btn-outline" id="cta-contact-btn">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
