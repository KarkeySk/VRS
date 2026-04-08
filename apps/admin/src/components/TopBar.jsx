import { Bell, CircleHelp, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function TopBar({
  title,
  subtitle,
  showNewBooking,
  onNewBooking,
  onShowNotifications = () => {},
  onShowHelp = () => {},
}) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-base font-semibold m-0 text-brand-orange">{title}</h1>
        {subtitle && (
          <span className="text-sm text-txt-secondary">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          onClick={onShowNotifications}
          className="w-9 h-9 border-none bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-txt-primary flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={onShowHelp}
          className="w-9 h-9 border-none bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-txt-primary flex items-center justify-center"
        >
          <CircleHelp className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 border border-dark-border bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-txt-primary flex items-center justify-center"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* New Booking */}
        {showNewBooking && (
          <button onClick={onNewBooking} className="btn-action flex items-center gap-1.5 px-5 py-2.5 text-[13px]">
            <span className="text-base font-bold">+</span>
            New Booking
          </button>
        )}
      </div>
    </header>
  );
}
