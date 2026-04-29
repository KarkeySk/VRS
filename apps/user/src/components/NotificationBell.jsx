import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const dummyNotifications = [
  { id: 1, message: "Booking Confirmed", time: "2 mins ago" },
  { id: 2, message: "Vehicle Ready", time: "10 mins ago" },
  { id: 3, message: "Payment Successful", time: "1 hour ago" },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ position: "relative" }}>
      
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          background: "var(--bg-glass)",
          border: "1px solid var(--border)",
          borderRadius: "999px",
          cursor: "pointer",
          color: "var(--text-primary)",
        }}
      >
        <Bell size={18} />

        {/* Badge */}
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "var(--brand-gradient)",
            color: "var(--accent-ink)",
            fontSize: "10px",
            padding: "2px 5px",
            borderRadius: "999px",
            fontWeight: "700",
          }}
        >
          {dummyNotifications.length}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "10px",
            width: "260px",
            background: "var(--nav-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "12px",
            zIndex: 100,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "var(--text-primary)"
          }}>
            Notifications
          </h3>

          {dummyNotifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                {n.message}
              </p>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {n.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}