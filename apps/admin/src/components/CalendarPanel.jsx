import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Sample booking dates (month is 0-indexed) — these simulate real bookings
const BOOKED_DATES = [
  { year: 2026, month: 3, day: 4 },
  { year: 2026, month: 3, day: 8 },
  { year: 2026, month: 3, day: 12 },
  { year: 2026, month: 3, day: 15 },
  { year: 2026, month: 3, day: 18 },
  { year: 2026, month: 3, day: 22 },
  { year: 2026, month: 3, day: 25 },
  { year: 2026, month: 4, day: 3 },
  { year: 2026, month: 4, day: 10 },
  { year: 2026, month: 4, day: 17 },
  { year: 2026, month: 4, day: 24 },
];

function hasBooking(year, month, day) {
  return BOOKED_DATES.some(
    (b) => b.year === year && b.month === month && b.day === day
  );
}

function buildCalendarGrid(year, month) {
  // How many days in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // What day of the week does the 1st fall on (0 = Sunday)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Get today for comparison
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();

  const cells = [];

  // Leading empty cells for padding
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null });
  }

  // Actual day cells
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isToday: year === todayYear && month === todayMonth && d === todayDay,
      hasBooking: hasBooking(year, month, d),
    });
  }

  return cells;
}

export default function CalendarPanel() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const cells = buildCalendarGrid(viewYear, viewMonth);

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
  };

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold m-0">Calendar</h3>
        <div className="flex items-center gap-1">
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="bg-transparent border border-dark-border text-txt-secondary cursor-pointer text-[10px] px-2 py-1 rounded hover:text-brand-orange hover:border-brand-orange transition-colors mr-1"
            >
              Today
            </button>
          )}
          <button
            onClick={goToPrev}
            className="bg-transparent border-none text-txt-secondary cursor-pointer text-sm hover:text-txt-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="bg-transparent border-none text-txt-secondary cursor-pointer text-sm hover:text-txt-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[13px] text-txt-secondary mb-4 m-0">
        {MONTH_NAMES[viewMonth]} {viewYear}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-xs font-semibold text-txt-secondary">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((cell, i) => {
          if (cell.day === null) {
            return (
              <div
                key={i}
                className="cal-day cal-other aspect-square flex items-center justify-center text-[13px] rounded-md text-txt-muted opacity-40"
              />
            );
          }
          return (
            <div
              key={i}
              className={`cal-day aspect-square flex items-center justify-center text-[13px] rounded-md cursor-pointer transition-all ${
                cell.isToday
                  ? "cal-today bg-brand-orange text-dark font-semibold"
                  : cell.hasBooking
                  ? "text-brand-orange font-semibold"
                  : "text-txt-secondary"
              }`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
