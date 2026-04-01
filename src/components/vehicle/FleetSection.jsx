import { useEffect, useRef } from 'react'

const vehicles = [
  {
    id: 1,
    name: 'Toyota Hilux Invincible',
    image: '/images/vehicle-hilux.png',
    seats: '5 Seats',
    engine: '2.8L D4D',
    price: '4,500',
    unit: '/day',
  },
  {
    id: 2,
    name: 'Mahindra Scorpio',
    image: '/images/vehicle-scorpio.png',
    seats: '7 Seats',
    engine: '2.2L mHawk',
    price: '6,000',
    unit: '/day',
  },
]

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
    title: 'Real-time Telemetry',
    desc: 'GPS tracking with live altitude, speed & diagnostics on every run.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Direct Verification',
    desc: 'All vehicles pass 120-point inspection before every expedition.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="17" r=".5"/>
      </svg>
    ),
    title: 'TPMS Certified',
    desc: 'Tire pressure monitoring with instant alerts for alpine safety.',
  },
]

export default function FleetSection() {
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="fleet" id="fleet" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="fleet-header reveal">
          <span className="section-label" id="fleet-label">Our fleet of warriors</span>
          <h2 className="section-title" id="fleet-title">THE ARMORED FLEET</h2>
          <p className="section-subtitle" id="fleet-subtitle">
            Engineered and hardened to take on the grittiest altitudes.
            Each repurposed and overhauled to go further.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="fleet-grid" id="fleet-grid">
          {vehicles.map((v) => (
            <div className="vehicle-card reveal" key={v.id} id={`vehicle-card-${v.id}`}>
              <div style={{ overflow: 'hidden' }}>
                <img
                  className="vehicle-card-img"
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                />
              </div>
              <div className="vehicle-card-body">
                <h3 className="vehicle-card-name">{v.name}</h3>
                <div className="vehicle-card-meta">
                  <span className="vehicle-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {v.seats}
                  </span>
                  <span className="vehicle-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                      <polygon points="16 8 20 5.5 20 13.5 16 11 16 8"/>
                    </svg>
                    {v.engine}
                  </span>
                </div>
                <div className="vehicle-card-price">
                  <span className="price">Rs. {v.price}</span>
                  <span className="unit">{v.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Strip */}
        <div className="features-strip reveal" id="features-strip">
          {features.map((f, i) => (
            <div className="feature-item" key={i} id={`feature-item-${i}`}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-text">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
