import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const ThemeContext = createContext(null)
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'

function storageKey(userId) {
  // Store per-user theme preference.
  return `bhatbhati-theme-admin-${userId || 'guest'}`
}

function applyTheme(theme) {
  // Apply theme + brand to the root element.
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-brand', 'base')
}

function readTheme(userId) {
  // Default to dark when rendering on the server.
  if (typeof window === 'undefined') return THEME_DARK
  // Read the stored value, fallback to dark.
  const current = localStorage.getItem(storageKey(userId))
  return current === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
}

export function ThemeProvider({ children }) {
  // Track current user id for user-scoped storage.
  const [userId, setUserId] = useState('guest')
  // Local revision forces a re-render after storage updates.
  const [revision, setRevision] = useState(0)
  void revision
  // Theme is derived from storage each render.
  const theme = readTheme(userId)

  useEffect(() => {
    // Keep the theme key scoped to the current auth user.
    let unsub = null
    authService.getSession().then((session) => {
      setUserId(session?.user?.id ?? 'guest')
    }).catch(() => {
      setUserId('guest')
    })

    try {
      const result = authService.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? 'guest')
      })
      unsub = result?.data?.listener?.subscription
    } catch {
      unsub = null
    }

    return () => {
      unsub?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    // Apply theme on mount and when it changes.
    applyTheme(theme)
  }, [theme])

  const setAppTheme = useCallback((nextTheme) => {
    // Persist theme per user to localStorage.
    const safe = nextTheme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    localStorage.setItem(storageKey(userId), safe)
    applyTheme(safe)
    // Bump revision to refresh consumers.
    setRevision((prev) => prev + 1)
  }, [userId])

  const toggleTheme = useCallback(() => {
    // Toggle between light and dark.
    setAppTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [theme, setAppTheme])

  const value = useMemo(() => ({
    // Export both the theme and helper actions.
    theme,
    isDark: theme === THEME_DARK,
    setTheme: setAppTheme,
    toggleTheme,
  }), [theme, setAppTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  // Guard against usage outside the provider.
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
