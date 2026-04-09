import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Car,
  Gauge,
  Mountain,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { bookingService } from "@bhatbhati/shared/services/bookingService.js";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import { uiAssetService } from "@bhatbhati/shared/services/uiAssetService.js";
import BookingsList from "@/components/BookingsList";
import CalendarPanel from "@/components/CalendarPanel";
import StatsCard from "@/components/StatsCard";
import TrackingChart from "@/components/TrackingChart";
import WeatherPanel from "@/components/WeatherPanel";

const VEHICLE_THEME = {
  bike: {
    id: "bike",
    label: "Bikes",
    subtitle: "Quick city and mountain connectors",
    accentClass: "theme-bike",
    Icon: Bike,
  },
  car: {
    id: "car",
    label: "Cars",
    subtitle: "Comfort, family and daily fleet",
    accentClass: "theme-car",
    Icon: Car,
  },
  jeep: {
    id: "jeep",
    label: "Jeeps",
    subtitle: "Off-road and expedition heavy duty",
    accentClass: "theme-jeep",
    Icon: Truck,
  },
};

function mapStatus(status) {
  if (status === "active" || status === "confirmed") return "ACTIVE";
  if (status === "pending") return "PARTIAL";
  if (status === "cancelled") return "OVERDUE";
  return "COMPLETED";
}

function formatDateRange(start, end) {
  if (!start || !end) return "Date not set";
  const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endDate = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startDate} - ${endDate}`;
}

function classifyVehicleTheme(vehicle) {
  const haystack = `${vehicle?.type ?? ""} ${vehicle?.name ?? ""} ${vehicle?.category ?? ""}`.toLowerCase();
  if (haystack.includes("bike") || haystack.includes("motor")) return "bike";
  if (
    haystack.includes("jeep") ||
    haystack.includes("4x4") ||
    haystack.includes("off-road") ||
    haystack.includes("offroad") ||
    haystack.includes("suv")
  ) return "jeep";
  return "car";
}

function extractDriveType(notes) {
  if (!notes) return "SELF-DRIVE";
  if (typeof notes !== "string") return "SELF-DRIVE";

  try {
    const parsed = JSON.parse(notes);
    return parsed?.bookingType === "with-driver" || parsed?.drive_type === "with-driver"
      ? "WITH DRIVER"
      : "SELF-DRIVE";
  } catch {
    return "SELF-DRIVE";
  }
}

function extractExtras(notes) {
  if (!notes || typeof notes !== "string") return "Standard package";

  try {
    const parsed = JSON.parse(notes);
    if (parsed?.route) return `Route: ${parsed.route}`;
  } catch {
    // Notes are sometimes plain text; use as-is below.
  }

  return notes;
}

export default function DashboardPage({ onNavigate = () => {} }) {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookingFallbackImage, setBookingFallbackImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");
  const [activeTheme, setActiveTheme] = useState("all");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [bookingsData, vehiclesData, assets] = await Promise.all([
        bookingService.getAll(),
        vehicleService.getAllForAdmin(),
        uiAssetService.getMany(["admin_booking_fallback"]),
      ]);
      setBookings(bookingsData ?? []);
      setVehicles(vehiclesData ?? []);

      const assetMap = new Map((assets ?? []).map((a) => [a.asset_key, a.image_url]));
      setBookingFallbackImage(assetMap.get("admin_booking_fallback") || "");
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = bookings.filter((b) => b.status === "active" || b.status === "confirmed").length;
  const returnedCount = bookings.filter((b) => b.status === "completed").length;
  const availableVehicles = vehicles.filter((v) => v.is_available).length;
  const capacityPercent = vehicles.length ? Math.round((activeCount / vehicles.length) * 100) : 0;

  const fleetThemeStats = useMemo(() => {
    const stats = {
      bike: { total: 0, available: 0 },
      car: { total: 0, available: 0 },
      jeep: { total: 0, available: 0 },
    };

    vehicles.forEach((vehicle) => {
      const key = classifyVehicleTheme(vehicle);
      stats[key].total += 1;
      if (vehicle.is_available) stats[key].available += 1;
    });

    return stats;
  }, [vehicles]);

  const bookingsByTheme = useMemo(() => {
    const grouped = { bike: [], car: [], jeep: [] };

    bookings.forEach((booking) => {
      const key = classifyVehicleTheme(booking.vehicles);
      grouped[key].push(booking);
    });

    return grouped;
  }, [bookings]);

  const themedBookings = useMemo(() => {
    if (activeTheme === "all") return bookings;
    return bookingsByTheme[activeTheme] ?? [];
  }, [activeTheme, bookings, bookingsByTheme]);

  const mapped = useMemo(
    () => themedBookings.map((booking) => ({
      id: booking.id,
      vehicle: booking.vehicles?.name || "Unknown Vehicle",
      image: booking.vehicles?.image || bookingFallbackImage || "",
      type: extractDriveType(booking.notes),
      customer: booking.profiles?.full_name || "Unknown Customer",
      dates: formatDateRange(booking.start_date, booking.end_date),
      extras: extractExtras(booking.notes),
      status: mapStatus(booking.status),
      price: `NPR ${Number(booking.total_price || 0).toLocaleString()}`,
    })),
    [themedBookings, bookingFallbackImage],
  );

  const upcomingBookings = mapped.filter((b) => b.status === "ACTIVE" || b.status === "PARTIAL");
  const pastBookings = mapped.filter((b) => b.status === "COMPLETED" || b.status === "OVERDUE");

  const activeThemeLabel = activeTheme === "all" ? "All Vehicle Types" : VEHICLE_THEME[activeTheme].label;

  const handleStatusChange = async (status) => {
    if (!selectedBooking?.id) return;
    setIsSaving(true);
    try {
      await bookingService.update(selectedBooking.id, { status: status.toLowerCase() });
      setFlashMessage(`Booking updated to ${status}.`);
      setSelectedBooking(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to update booking");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking?.id) return;
    const ok = window.confirm("Delete this booking permanently?");
    if (!ok) return;
    setIsSaving(true);
    try {
      await bookingService.delete(selectedBooking.id);
      setFlashMessage("Booking deleted.");
      setSelectedBooking(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete booking");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {flashMessage && (
        <div className="mb-4 rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-xs text-status-green flex items-center justify-between">
          <span>{flashMessage}</span>
          <button type="button" className="bg-transparent border-none text-status-green cursor-pointer" onClick={() => setFlashMessage("")}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
          {error}
        </div>
      )}

      <section className="fleet-command-banner mb-6">
        <div className="fleet-command-banner__content">
          <p className="fleet-command-banner__kicker">Vehicle Themes Online</p>
          <h2>Fleet Command Center</h2>
          <p>
            Monitor bikes, cars, and jeeps with one clear cockpit. Theme filter is now live for booking operations.
          </p>
          <div className="fleet-command-banner__meta">
            <span><Gauge className="w-4 h-4" /> {activeCount} active trips</span>
            <span><ShieldCheck className="w-4 h-4" /> {availableVehicles} available units</span>
            <span><Mountain className="w-4 h-4" /> {returnedCount} completed returns</span>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {Object.values(VEHICLE_THEME).map((theme) => {
          const stats = fleetThemeStats[theme.id];
          const Icon = theme.Icon;
          const isActive = activeTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setActiveTheme((prev) => (prev === theme.id ? "all" : theme.id))}
              className={`theme-tile ${theme.accentClass} ${isActive ? "theme-tile--active" : ""}`}
            >
              <div className="theme-tile__top">
                <span className="theme-tile__icon"><Icon className="w-5 h-5" /></span>
                <span className="theme-tile__tag">{stats.available}/{stats.total} free</span>
              </div>
              <h3>{theme.label}</h3>
              <p>{theme.subtitle}</p>
              <div className="theme-tile__bar">
                <span style={{ width: `${stats.total ? Math.round((stats.available / stats.total) * 100) : 0}%` }} />
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_310px] mb-6">
        <div className="vehicle-theme-panel">
          <div className="vehicle-theme-panel__header">
            <div>
              <p className="vehicle-theme-panel__eyebrow">Bookings Stream</p>
              <h3>{activeThemeLabel}</h3>
            </div>
            <button type="button" className="btn-action px-4 py-2 text-xs" onClick={() => onNavigate("bookings")}>
              Open Full Bookings
            </button>
          </div>
          <BookingsList
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
            onManageBooking={(booking) => setSelectedBooking(booking)}
          />
        </div>

        <div className="space-y-6">
          <StatsCard
            label="Fleet Deployment"
            value={`${capacityPercent}%`}
            description="Share of total fleet currently deployed"
            progress={capacityPercent}
            barColor="bg-brand-orange"
          />
          <StatsCard
            label="Availability"
            value={`${availableVehicles}/${vehicles.length || 0}`}
            description="Vehicles currently available for new requests"
            progress={vehicles.length ? Math.round((availableVehicles / vehicles.length) * 100) : 0}
            barColor="bg-brand-city"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <CalendarPanel />
          <WeatherPanel />
        </div>
        <TrackingChart activeUnits={activeCount} />
      </section>

      {isLoading && (
        <div className="mt-4 text-sm text-txt-secondary">Refreshing data...</div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-dark border border-dark-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit Booking</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="bg-transparent border-none text-txt-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm mb-5">
              <p><span className="text-txt-secondary">Booking ID:</span> {selectedBooking.id.slice(0, 8)}</p>
              <p><span className="text-txt-secondary">Customer:</span> {selectedBooking.customer}</p>
              <p><span className="text-txt-secondary">Vehicle:</span> {selectedBooking.vehicle}</p>
              <p><span className="text-txt-secondary">Status:</span> {selectedBooking.status}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button type="button" disabled={isSaving} onClick={() => handleStatusChange("CONFIRMED")} className="px-3 py-2 rounded-md bg-brand-orange/20 text-brand-orange border border-brand-orange/30 disabled:opacity-50">
                Set Confirmed
              </button>
              <button type="button" disabled={isSaving} onClick={() => handleStatusChange("ACTIVE")} className="px-3 py-2 rounded-md bg-status-green/20 text-status-green border border-status-green/30 disabled:opacity-50">
                Set Active
              </button>
              <button type="button" disabled={isSaving} onClick={() => handleStatusChange("COMPLETED")} className="px-3 py-2 rounded-md bg-[rgba(100,150,200,0.2)] text-[#64d4ff] border border-[#64d4ff]/40 disabled:opacity-50">
                Set Completed
              </button>
              <button type="button" disabled={isSaving} onClick={() => handleStatusChange("CANCELLED")} className="px-3 py-2 rounded-md bg-status-red/20 text-status-red border border-status-red/30 disabled:opacity-50">
                Set Cancelled
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-3 py-2 rounded-md bg-status-red/20 text-status-red border border-status-red/30 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => onNavigate("bookings")}
                className="btn-action px-5 py-2 text-sm"
              >
                Open Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
