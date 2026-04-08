import { CalendarDays } from "lucide-react";

export default function BookingsPage({ onNavigate }) {
  return (
    <div>
      <p className="text-sm text-txt-secondary mb-4">
        This page shares the Dashboard booking view. Select{" "}
        <strong className="text-brand-orange">Dashboard</strong> to manage bookings.
      </p>
      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-8 text-center">
        <CalendarDays className="w-16 h-16 mx-auto mb-4 text-txt-muted" />
        <h3 className="text-xl font-bold mb-2">Bookings Calendar</h3>
        <p className="text-txt-secondary text-sm mb-4">
          View and manage all upcoming and past expedition bookings from the dashboard.
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="btn-action px-6 py-2.5 text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
