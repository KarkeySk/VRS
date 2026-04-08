import { useEffect, useMemo, useState } from "react";
import { bookingService } from "@bhatbhati/shared/services/bookingService.js";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import { uiAssetService } from "@bhatbhati/shared/services/uiAssetService.js";
import { X } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import CalendarPanel from "@/components/CalendarPanel";
import WeatherPanel from "@/components/WeatherPanel";
import BookingsList from "@/components/BookingsList";
import TrackingChart from "@/components/TrackingChart";
import StatsCard from "@/components/StatsCard";

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

export default function DashboardPage({ onNavigate = () => {} }) {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [heroImage, setHeroImage] = useState("");
  const [bookingFallbackImage, setBookingFallbackImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [bookingsData, vehiclesData, assets] = await Promise.all([
        bookingService.getAll(),
        vehicleService.getAllForAdmin(),
        uiAssetService.getMany(["admin_hero_banner", "admin_booking_fallback"]),
      ]);
      setBookings(bookingsData ?? []);
      setVehicles(vehiclesData ?? []);
      const assetMap = new Map((assets ?? []).map((a) => [a.asset_key, a.image_url]));
      setHeroImage(assetMap.get("admin_hero_banner") || "");
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

  const mapped = useMemo(() => bookings.map((booking) => ({
    id: booking.id,
    vehicle: booking.vehicles?.name || "Unknown Vehicle",
    image: booking.vehicles?.image || bookingFallbackImage || "",
    type: "SELF-DRIVE",
    customer: booking.profiles?.full_name || "Unknown Customer",
    dates: formatDateRange(booking.start_date, booking.end_date),
    extras: booking.notes || "Standard package",
    status: mapStatus(booking.status),
    price: `NPR ${Number(booking.total_price || 0).toLocaleString()}`,
  })), [bookings, bookingFallbackImage]);

  const upcomingBookings = mapped.filter((b) => b.status === "ACTIVE" || b.status === "PARTIAL");
  const pastBookings = mapped.filter((b) => b.status === "COMPLETED" || b.status === "OVERDUE");

  const activeCount = bookings.filter((b) => b.status === "active" || b.status === "confirmed").length;
  const returnedCount = bookings.filter((b) => b.status === "completed").length;
  const capacityPercent = vehicles.length ? Math.round((activeCount / vehicles.length) * 100) : 0;
  const availableVehicles = vehicles.filter((v) => v.is_available).length;
  const fleetCapacityDescription = `${availableVehicles} vehicles free out of ${vehicles.length || 0}`;

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

      {/* Hero Banner */}
      <HeroBanner
        imageUrl={heroImage}
        activeCount={activeCount}
        upcomingCount={upcomingBookings.length}
        returnedCount={returnedCount}
      />

      {/* Calendar/Weather + Bookings Grid */}
      <div className="grid grid-cols-[300px_1fr] gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-6">
          <CalendarPanel />
          <WeatherPanel />
        </div>

        {/* Right Column: Bookings */}
        <BookingsList
          upcomingBookings={upcomingBookings}
          pastBookings={pastBookings}
          onManageBooking={(booking) => setSelectedBooking(booking)}
        />
      </div>

      {/* Tracking + Stats Row */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <TrackingChart activeUnits={activeCount} />

        <div className="space-y-6">
          <StatsCard
            label="Driver Availability"
            value={`${capacityPercent}%`}
            description="% of fleet currently deployed"
            progress={capacityPercent}
          />
          <StatsCard
            label="Fleet Capacity"
            value={`${capacityPercent}%`}
            description={fleetCapacityDescription}
            progress={capacityPercent}
            barColor="bg-[#3b82f6]"
          />
        </div>
      </div>

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
