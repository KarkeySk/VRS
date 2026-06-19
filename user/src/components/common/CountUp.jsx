import { useEffect, useRef, useState } from 'react'

// Split a stat string like "200+", "4.9★" or "24/7" into an animatable number
// plus the surrounding text we keep fixed (prefix / suffix). Returns target=null
// for values with no leading number so we just render them as-is.
function parseStat(raw) {
  const match = String(raw).match(/^(\D*)([\d,]*\.?\d+)(.*)$/)
  if (!match) return { target: null, raw }
  const [, prefix, numStr, suffix] = match
  const clean = numStr.replace(/,/g, '')
  const decimals = clean.includes('.') ? clean.split('.')[1].length : 0
  return { prefix, target: parseFloat(clean), decimals, suffix }
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/**
 * Animated count-up that runs once when the element scrolls into view.
 * @param {string} value     - the final display value, e.g. "200+", "4.9★"
 * @param {number} duration  - animation length in ms
 * @param {number} delay     - delay before starting (for staggering)
 */
export default function CountUp({ value, duration = 1600, delay = 0, className }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(null)
  const { prefix = '', target, decimals = 0, suffix = '' } = parseStat(value)

  useEffect(() => {
    if (target == null) return
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplay(value)
      return
    }

    let raf
    let timer
    let started = false

    const run = () => {
      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const current = easeOutCubic(progress) * target
        setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`)
        if (progress < 1) raf = requestAnimationFrame(tick)
        else setDisplay(value) // snap to the exact original to avoid format drift
      }
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true
            timer = setTimeout(run, delay)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (timer) clearTimeout(timer)
    }
  }, [value, duration, delay, target, decimals, prefix, suffix])

  // Render a formatted zero before the animation starts so the final number
  // never flashes on first paint.
  const initial = target == null ? value : `${prefix}${(0).toFixed(decimals)}${suffix}`

  return (
    <span ref={ref} className={className}>
      {display ?? initial}
    </span>
  )
}
