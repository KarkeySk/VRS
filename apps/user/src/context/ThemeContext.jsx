import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'

function getStorageKey(userId) {
  return `bhatbhati-theme-user-${userId || 'guest'}`
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'guest'
  const [theme, setTheme] = useState(THEME_DARK)

  useEffect(() => {
    const key = getStorageKey(userId)
    const stored = localStorage.getItem(key)
    const initial = stored === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    setTheme(initial)
    applyTheme(initial)
  }, [userId])

  const updateTheme = (nextTheme) => {
    const safeTheme = nextTheme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
    setTheme(safeTheme)
    applyTheme(safeTheme)
    localStorage.setItem(getStorageKey(userId), safeTheme)
  }

  const toggleTheme = () => {
    updateTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }

  const value = useMemo(() => ({
    theme,
    isDark: theme === THEME_DARK,
    setTheme: updateTheme,
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
