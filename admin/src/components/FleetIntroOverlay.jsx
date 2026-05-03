import { useEffect, useState } from 'react'

/*
  FleetIntroOverlay notes:
  - duration sets total display time.
  - onDone fires when it finishes.
  - Uses CSS for animation.
  - No external data dependencies.
  - Intended as a short intro splash.
  - Can be disabled by the parent.
  - Timers are cleaned up on unmount.
  - Uses local state for fade-out.
  - Purely presentational.
  - Safe to reuse elsewhere.
*/

export default function FleetIntroOverlay({ duration = 1900, onDone = () => {} }) {
  // Track the leave animation state.
  // duration controls how long the overlay stays visible.
  // onDone fires when the intro completes.
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Drive the fade-out and completion callbacks.
    const fadeAt = Math.max(200, duration - 350)
    // Trigger the fade-out shortly before completion.
    const fadeTimer = setTimeout(() => setLeaving(true), fadeAt)
    // Fire the completion callback at the end.
    const doneTimer = setTimeout(() => onDone(), duration)

    return () => {
      // Cleanup timers on unmount.
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [duration, onDone])

  // Render the animated intro overlay.
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
