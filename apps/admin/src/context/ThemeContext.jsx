import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const ThemeContext = createContext(null)
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'

function storageKey(userId) {
  return `bhatbhati-theme-admin-${userId || 'guest'}`
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [userId, setUserId] = useState('guest')
  const [theme, setTheme] = useState(THEME_DARK)

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
    const current = localStorage.getItem(storageKey(userId))
    const next = current === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    setTheme(next)
    applyTheme(next)
  }, [userId])

  const setAppTheme = (nextTheme) => {
    const safe = nextTheme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    setTheme(safe)
    applyTheme(safe)
    localStorage.setItem(storageKey(userId), safe)
  }

  const toggleTheme = () => setAppTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)

  const value = useMemo(() => ({
    theme,
    isDark: theme === THEME_DARK,
    setTheme: setAppTheme,
    toggleTheme,
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
