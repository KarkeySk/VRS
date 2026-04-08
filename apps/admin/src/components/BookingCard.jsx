import { CalendarDays } from "lucide-react";

const STATUS_STYLES = {
  ACTIVE:    { dot: "bg-status-green",  text: "text-status-green" },
  PARTIAL:   { dot: "bg-status-yellow", text: "text-status-yellow" },
  OVERDUE:   { dot: "bg-status-red",    text: "text-status-red" },
  COMPLETED: { dot: "bg-status-green",  text: "text-status-green" },
};

const TYPE_STYLES = {
  "SELF-DRIVE":  { bg: "bg-[rgba(100,150,200,0.2)]", text: "text-[#64d4ff]" },
  "WITH DRIVER": { bg: "bg-[rgba(139,92,246,0.2)]",  text: "text-[#a78bfa]" },
};

export default function BookingCard({ booking }) {
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.PARTIAL;
  const type = TYPE_STYLES[booking.type] || TYPE_STYLES["SELF-DRIVE"];

  return (
    <div className="booking-card flex gap-4 p-4 bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-lg transition-all duration-200">
      {/* Vehicle image */}
      {booking.image ? (
        <img
          src={booking.image}
          alt={booking.vehicle}
          className="w-[100px] h-[70px] rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-[100px] h-[70px] rounded-md bg-dark-border flex-shrink-0" />
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold m-0 truncate">{booking.vehicle}</h3>
          <span className={`inline-block px-2 py-0.5 ${type.bg} ${type.text} rounded text-[11px] font-semibold shrink-0`}>
            {booking.type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-txt-secondary mb-1">
          <span>▲ {booking.customer}</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {booking.dates}
          </span>
        </div>
        <p className="text-xs text-txt-secondary m-0">{booking.extras}</p>
      </div>

      {/* Status & Price */}
      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-1.5 mb-1">
          <span className={`w-2 h-2 rounded-full ${status.dot} inline-block`} />
          <span className={`text-xs ${status.text} font-bold`}>{booking.status}</span>
        </div>
        <p className="text-base font-bold m-0">{booking.price}</p>
        <p className="text-xs text-brand-orange cursor-pointer mt-1 m-0 hover:text-brand-orange-dark transition-colors">
          Manage Details
        </p>
      </div>
    </div>
  );
}
