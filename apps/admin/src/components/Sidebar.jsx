import {
  LayoutGrid,
  FileText,
  CalendarDays,
  CheckCircle,
  Settings as SettingsIcon,
  Cog,
  User,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "fleet", label: "Fleet Management", icon: FileText },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "compliance", label: "Compliance", icon: CheckCircle },
  { id: "fleet", label: "Fleet", icon: FileText },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "compliance", label: "Checks", icon: CheckCircle },
  { id: "operations", label: "Operations", icon: Cog },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-[207px] bg-dark-deeper border-r border-dark-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-dark-border">
        <p className="text-[13px] text-txt-secondary uppercase tracking-wider font-semibold m-0">
          Bhatbhati
          Bhatbhate
        </p>
        <p className="text-base font-bold text-txt-primary mt-1 m-0 tracking-wide">
          HIMALAYAN FLEET
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                onNavigate(item.id);
              }}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "nav-active bg-brand-orange text-dark font-semibold"
                  : "text-txt-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </a>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-border">
        <button
          onClick={() => onNavigate("add-vehicle")}
          className="btn-action w-full py-3 text-[13px] mb-4"
        >
          + Add New Vehicle
        </button>
        <div
          onClick={() => onNavigate("admin-profile")}
          className="flex items-center gap-3 px-2 cursor-pointer rounded-lg py-2 hover:bg-[rgba(255,143,63,0.1)] transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-md bg-brand-orange flex items-center justify-center font-bold text-xs text-dark">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold m-0">Chakuu</p>
            <p className="text-xs text-txt-secondary m-0">Fleet Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
