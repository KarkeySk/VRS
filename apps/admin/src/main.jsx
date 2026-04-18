import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

/*
  Boot sequence notes:
  - Mounts React at #root.
  - Enables StrictMode in dev.
  - Provides theme context to all routes.
  - Loads Tailwind and custom CSS first.
  - Keeps bootstrap logic minimal.
  - App owns routing + layout.
  - Root element comes from index.html.
  - No data fetching occurs here.
  - Safe to keep this file tiny.
  - Changes here affect the whole app.
*/
// Bootstrap the admin app with theme context.
// StrictMode enables extra checks in development.
// ThemeProvider wires up light/dark preferences.
// App contains the router and page shell.
// The CSS import loads Tailwind + custom styles.
// Root element is provided by index.html.
// Rendering starts once the DOM is ready.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provide theme context to all routes. */}
    <ThemeProvider>
      {/* Main admin application entry. */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)
