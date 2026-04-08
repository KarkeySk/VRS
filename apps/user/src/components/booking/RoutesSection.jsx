import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uiAssetService } from '@bhatbhati/shared/services/uiAssetService.js'

const routes = [
  {
    id: 1,
    name: 'Upper Mustang',
    image: '/images/route-mustang.png',
    tag: 'Legendary',
    days: '5 Days',
    distance: '320 km',
  },
  {
    id: 2,
    name: 'Annapurna Base',
    image: '/images/route-annapurna.png',
    tag: 'Popular',
    days: '7 Days',
    distance: '480 km',
  },
  {
    id: 3,
    name: 'Khumbu',
    image: '/images/hero-mountain.png',
    tag: 'Extreme',
    days: '10 Days',
    distance: '560 km',
  },
]

const routeImageAssetKeys = {
  'Upper Mustang': 'user_route_upper_mustang',
  'Annapurna Base': 'user_route_annapurna_base',
  Khumbu: 'user_route_khumbu',
}

export default function RoutesSection() {
  const sectionRef = useRef(null)
  const navigate = useNavigate()
  const [routeImageMap, setRouteImageMap] = useState({})

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

  useEffect(() => {
    const loadRouteImages = async () => {
      try {
        const assets = await uiAssetService.getMany(Object.values(routeImageAssetKeys))
        const map = {}
        for (const asset of assets ?? []) {
          map[asset.asset_key] = asset.image_url
        }
        setRouteImageMap(map)
      } catch (error) {
        console.error('Failed to load route images from ui_assets:', error)
      }
    }

    loadRouteImages()
  }, [])

  return (
    <section className="routes" id="routes" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="routes-header reveal">
          <span className="section-label" id="routes-label">Best places to ride</span>
          <h2 className="section-title" id="routes-title">POPULAR ROUTES</h2>
          <p className="section-subtitle" id="routes-subtitle">
            These are popular routes in Nepal.
            Pick one and find matching vehicles.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="routes-grid" id="routes-grid">
          {routes.map((route, i) => {
            const assetKey = routeImageAssetKeys[route.name]
            const imageUrl = (assetKey && routeImageMap[assetKey]) || route.image

            return (
            <div
              className="route-card reveal"
              key={route.id}
              id={`route-card-${route.id}`}
              style={{ transitionDelay: `${i * 0.15}s` }}
              onClick={() => navigate('/terrain')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/terrain')
                }
              }}
            >
              <div className="route-card-img">
                <img src={imageUrl} alt={route.name} loading="lazy" />
              </div>
              <div className="route-card-overlay"></div>
              <div className="route-card-content">
                <span className="route-card-tag">{route.tag}</span>
                <h3 className="route-card-name">{route.name}</h3>
                <div className="route-card-details">
                  <span className="route-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {route.days}
                  </span>
                  <span className="route-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {route.distance}
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  )
}
