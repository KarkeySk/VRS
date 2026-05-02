import { useEffect, useState } from 'react'

export default function FleetIntroOverlay({ duration = 1900, onDone = () => {} }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const fadeAt = Math.max(200, duration - 350)
    const fadeTimer = setTimeout(() => setLeaving(true), fadeAt)
    const doneTimer = setTimeout(() => onDone(), duration)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [duration, onDone])

  return (
    <div className={`fleet-intro ${leaving ? 'fleet-intro--leave' : ''}`} aria-hidden>
      <div className="fleet-intro__glow" />
      <div className="fleet-intro__content">
        <p className="fleet-intro__label">Bhatbhate Fleet</p>
        <h2 className="fleet-intro__title">Loading Fleet</h2>
        <div className="fleet-road">
          <span className="fleet-road__line" />
          <span className="fleet-road__line" />
          <span className="fleet-road__line" />
          <span className="fleet-vehicle fleet-vehicle--one" />
          <span className="fleet-vehicle fleet-vehicle--two" />
          <span className="fleet-vehicle fleet-vehicle--three" />
        </div>
      </div>
    </div>
  )
}
