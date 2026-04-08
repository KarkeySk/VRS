import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicles } from '../../hooks/useVehicles'
import { normalizeVehicle } from '../../utils/vehicleMapper'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    title: 'Live GPS',
    desc: 'Track location, speed, and basic status live.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Checked Vehicles',
    desc: 'Every vehicle is checked before each trip.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r=".5" />
      </svg>
    ),
    title: 'Tire Alerts',
    desc: 'Get alerts when tire pressure is low.',
  },
]

export default function FleetSection() {
  const sectionRef = useRef(null)
  const navigate = useNavigate()
  const { vehicles: dbVehicles, loading, error } = useVehicles()
  const vehicles = (dbVehicles ?? []).map(normalizeVehicle).slice(0, 2)

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
  }, [loading, vehicles.length])

  return (
    <section className="fleet" id="fleet" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="fleet-header reveal">
          <span className="section-label" id="fleet-label">Our vehicles</span>
          <h2 className="section-title" id="fleet-title">READY FLEET</h2>
          <p className="section-subtitle" id="fleet-subtitle">
            Good vehicles for city roads and mountain roads.
            Clean, checked, and ready to rent.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="fleet-grid" id="fleet-grid">
          {loading && (
            <div
              className="reveal"
              style={{
                gridColumn: '1 / -1',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
              }}
            >
              Loading fleet...
            </div>
          )}

          {!loading && vehicles.map((v) => (
            <div
              className="vehicle-card reveal"
              key={v.id}
              id={`vehicle-card-${v.id}`}
              onClick={() => navigate(`/vehicles/${v.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/vehicles/${v.id}`)
                }
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <img
                  className="vehicle-card-img"
                  src={v.image || '/images/vehicle-hilux.png'}
                  alt={v.name}
                  loading="lazy"
                />
              </div>
              <div className="vehicle-card-body">
                <h3 className="vehicle-card-name">{v.name}</h3>
                <div className="vehicle-card-meta">
                  <span className="vehicle-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {v.capacity || 'N/A'}
                  </span>
                  <span className="vehicle-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                      <polygon points="16 8 20 5.5 20 13.5 16 11 16 8" />
                    </svg>
                    {v.engine}
                  </span>
                </div>
                <div className="vehicle-card-price">
                  <span className="price">Rs. {Number(v.price).toLocaleString()}</span>
                  <span className="unit">/day</span>
                </div>
              </div>
            </div>
          ))}

          {!loading && vehicles.length === 0 && (
            <div
              className="reveal"
              style={{
                gridColumn: '1 / -1',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
                background: 'var(--bg-card)',
              }}
            >
              <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                No vehicles are currently available.
              </p>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {error ? 'Could not load live fleet data.' : 'Please mark vehicles as available from the admin fleet panel.'}
              </p>
            </div>
          )}
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
