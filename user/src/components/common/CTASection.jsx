import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import CountUp from './CountUp'

const STATS = [
  { value: '200+', label: 'Vehicles' },
  { value: '50+',  label: 'Routes'   },
  { value: '4.9★', label: 'Rating'   },
  { value: '24/7', label: 'Support'  },
]

export default function CTASection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
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
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <p className="cta-eyebrow reveal">Nepal's Premier Vehicle Rental</p>
        <h2 className="cta-title reveal" id="cta-title">
          READY TO<br />START?
        </h2>
        <p className="cta-subtitle reveal">
          From Himalayan mountain trails to valley highways —<br />
          every road, every terrain, one platform.
        </p>
        <div className="cta-buttons reveal">
          <Link to="/vehicles" className="btn btn-primary" id="cta-explore-btn">
            Explore Vehicles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/terrain" className="btn-outline-white" id="cta-contact-btn">
            Plan by Terrain
          </Link>
        </div>
        <div className="cta-stats reveal">
          {STATS.map((s, i) => (
            <div key={s.label} className="cta-stat">
              <CountUp className="cta-stat-value" value={s.value} delay={i * 150} />
              <span className="cta-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
