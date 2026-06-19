import { Bell, CircleHelp, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/*
  TopBar notes:
  - title and subtitle are display-only.
  - onShowNotifications/onShowHelp are optional.
  - Theme toggle uses ThemeContext.
  - No internal state here.
  - Buttons use minimal styling.
  - Layout is fixed-height.
  - Designed for the admin shell.
  - Safe to reuse across pages.
*/

export default function TopBar({
  // Title and subtitle are shown on the left.
  title,
  subtitle,
  // Callbacks for top bar actions.
  onShowNotifications = () => {},
  onShowHelp = () => {},
}) {
  // Theme toggling is provided by the admin ThemeContext.
  const { isDark, toggleTheme } = useTheme()

  // Render the sticky top bar with actions.
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Page title */}
        <h1 className="text-base font-semibold m-0 text-brand-orange">{title}</h1>
        {subtitle && (
          // Subtitle is optional.
          <span className="text-sm text-txt-secondary">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          onClick={onShowNotifications}
          className="w-9 h-9 border-none bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-dark-hover hover:text-txt-primary flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={onShowHelp}
          className="w-9 h-9 border-none bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-dark-hover hover:text-txt-primary flex items-center justify-center"
        >
          <CircleHelp className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 border border-dark-border bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-dark-hover hover:text-txt-primary flex items-center justify-center"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
