import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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

const statusColors = {
  confirmed: "#34d399",
  approved: "#60bb46",
  submitted: "#3b82f6",
  "under-review": "#f59e0b",
};

export default function CalendarPanel() {
  const { user } = useAuth();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [bookedDays, setBookedDays] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Fetch user's booked dates from Supabase
  useEffect(() => {
    if (!user?.id) return;
    calendarService
      .getUserBookedDates(user.id, viewYear, viewMonth)
      .then(setBookedDays)
      .catch(() => setBookedDays([]));
  }, [user?.id, viewYear, viewMonth]);

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
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Calendar
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "10px",
                padding: "4px 8px",
                borderRadius: "6px",
                transition: "all 0.2s",
                marginRight: "8px",
              }}
              onMouseOver={(e) => {
                e.target.style.color = "var(--accent)";
                e.target.style.borderColor = "var(--accent)";
              }}
              onMouseOut={(e) => {
                e.target.style.color = "var(--text-secondary)";
                e.target.style.borderColor = "var(--border)";
              }}
            >
              Today
            </button>
          )}
          <button
            onClick={goToPrev}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "14px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.color = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
          </button>
          <button
            onClick={goToNext}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "14px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.color = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            <ChevronRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        {totalBookedDays > 0 && (
          <span
            style={{
              fontSize: "10px",
              padding: "4px 8px",
              borderRadius: "9999px",
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              fontWeight: "600",
            }}
          >
            {totalBookedDays} booked day{totalBookedDays > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        {DAY_LABELS.map((d, i) => (
          <span
            key={i}
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-secondary)",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {cells.map((cell, i) => {
          if (cell.day === null) {
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                  opacity: 0.4,
                }}
              />
            );
          }

          const hasBooking = cell.hasBooking;
          const mainStatus = hasBooking ? cell.bookings[0].status : null;
          const dotColor = statusColors[mainStatus] || "var(--accent)";

          return (
            <div
              key={i}
              onMouseEnter={() => cell.hasBooking && setHoveredDay(cell.day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                borderRadius: "8px",
                transition: "all 0.2s",
                position: "relative",
                fontWeight: cell.isToday || hasBooking ? "600" : "400",
                color: cell.isToday ? "var(--accent-ink)" : hasBooking ? dotColor : "var(--text-secondary)",
                background: cell.isToday
                  ? "var(--accent)"
                  : hasBooking
                  ? `${dotColor}15`
                  : "transparent",
                border: hasBooking && !cell.isToday ? `1px solid ${dotColor}30` : "1px solid transparent",
                cursor: hasBooking ? "pointer" : "default",
              }}
            >
              {cell.day}
              {hasBooking && !cell.isToday && (
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: dotColor,
                    position: "absolute",
                    bottom: "3px",
                  }}
                />
              )}
              {/* Tooltip showing booking details */}
              {hoveredDay === cell.day && hasBooking && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    whiteSpace: "nowrap",
                    zIndex: 20,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  }}
                >
                  {cell.bookings.map((b, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: "11px",
                        marginBottom:
                          j < cell.bookings.length - 1 ? "4px" : 0,
                      }}
                    >
                      <span
                        style={{
                          color: dotColor,
                          fontWeight: "600",
                        }}
                      >
                        {b.vehicleName}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          marginLeft: "6px",
                        }}
                      >
                        {b.status}
                      </span>
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
