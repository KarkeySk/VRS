import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'

function getStorageKey(userId) {
  return `bhatbhati-theme-user-${userId || 'guest'}`
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-brand', 'base')
}

function readTheme(userId) {
  if (typeof window === 'undefined') return THEME_DARK
  const stored = localStorage.getItem(getStorageKey(userId))
  return stored === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'guest'
  const [revision, setRevision] = useState(0)
  void revision
  const theme = readTheme(userId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const updateTheme = useCallback((nextTheme) => {
    const safeTheme = nextTheme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    localStorage.setItem(getStorageKey(userId), safeTheme)
    applyTheme(safeTheme)
    setRevision((prev) => prev + 1)
  }, [userId])

  const toggleTheme = useCallback(() => {
    updateTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [theme, updateTheme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === THEME_DARK,
    setTheme: updateTheme,
    toggleTheme,
  }), [theme, updateTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
