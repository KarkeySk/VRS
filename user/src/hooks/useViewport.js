import { useState, useEffect } from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * Used to branch inline styles responsively (inline styles can't use @media).
 *
 *   const isMobile = useViewport('(max-width: 768px)')
 */
export function useViewport(query = '(max-width: 768px)') {
  const getMatch = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false

  const [matches, setMatches] = useState(getMatch)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    setMatches(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Convenience: true on phones (≤768px). */
export function useIsMobile() {
  return useViewport('(max-width: 768px)')
}
