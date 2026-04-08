import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const ThemeContext = createContext(null)
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'

function storageKey(userId) {
  return `bhatbhati-theme-admin-${userId || 'guest'}`
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-brand', 'base')
}

function readTheme(userId) {
  if (typeof window === 'undefined') return THEME_DARK
  const current = localStorage.getItem(storageKey(userId))
  return current === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
}

export function ThemeProvider({ children }) {
  const [userId, setUserId] = useState('guest')
  const [revision, setRevision] = useState(0)
  void revision
  const theme = readTheme(userId)

  useEffect(() => {
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
    applyTheme(theme)
  }, [theme])

  const setAppTheme = useCallback((nextTheme) => {
    const safe = nextTheme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    localStorage.setItem(storageKey(userId), safe)
    applyTheme(safe)
    setRevision((prev) => prev + 1)
  }, [userId])

  const toggleTheme = useCallback(() => {
    setAppTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [theme, setAppTheme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === THEME_DARK,
    setTheme: setAppTheme,
    toggleTheme,
  }), [theme, setAppTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
