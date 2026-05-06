import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarService } from "@bhatbhati/shared/services/calendarService.js";

// Day labels used in the calendar header.
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Month names shown in the title.
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildCalendarGrid(year, month, bookedDays) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  const cells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayBookings = bookedDays.filter((b) => b.day === d);
    cells.push({
      day: d,
      isToday: year === todayYear && month === todayMonth && d === todayDay,
      bookings: dayBookings,
      hasBooking: dayBookings.length > 0,
    });
  }

  return cells;
}

export default function CalendarPanel() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [bookedDays, setBookedDays] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Fetch real booked dates from Supabase
  useEffect(() => {
    calendarService.getBookedDatesForMonth(viewYear, viewMonth)
      .then(setBookedDays)
      .catch(() => setBookedDays([]));
  }, [viewYear, viewMonth]);

  const cells = buildCalendarGrid(viewYear, viewMonth, bookedDays);

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

  const totalBookedDays = new Set(bookedDays.map((b) => b.day)).size;

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-txt-secondary m-0">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        {totalBookedDays > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-semibold">
            {totalBookedDays} booked day{totalBookedDays > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-xs font-semibold text-txt-secondary">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 text-center" style={{ position: 'relative' }}>
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
              onMouseEnter={() => cell.hasBooking && setHoveredDay(cell.day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`cal-day aspect-square flex flex-col items-center justify-center text-[13px] rounded-md transition-all relative ${
                cell.isToday
                  ? "cal-today bg-brand-orange text-dark font-semibold"
                  : cell.hasBooking
                  ? "text-brand-orange font-semibold cursor-pointer"
                  : "text-txt-secondary"
              }`}
              style={cell.hasBooking && !cell.isToday ? {
                background: 'rgba(232,115,42,0.08)',
                border: '1px solid rgba(232,115,42,0.15)',
              } : undefined}
            >
              {cell.day}
              {cell.hasBooking && !cell.isToday && (
                <span style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: '#e8732a', position: 'absolute', bottom: '3px',
                }} />
              )}
              {/* Tooltip showing vehicle details */}
              {hoveredDay === cell.day && cell.hasBooking && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                  transform: 'translateX(-50%)', background: '#141414',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {cell.bookings.map((b, j) => (
                    <div key={j} style={{ fontSize: '11px', marginBottom: j < cell.bookings.length - 1 ? '4px' : 0 }}>
                      <span style={{ color: '#e8732a', fontWeight: '600' }}>{b.vehicleName}</span>
                      <span style={{ color: '#888', marginLeft: '6px' }}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
