import { useEffect, useMemo, useState } from "react";
import { bookingService } from "@bhatbhati/shared/services/bookingService.js";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import { uiAssetService } from "@bhatbhati/shared/services/uiAssetService.js";
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

export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [heroImage, setHeroImage] = useState("");
  const [bookingFallbackImage, setBookingFallbackImage] = useState("");

  useEffect(() => {
    const load = async () => {
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
      }
    };
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
  const fleetCapacityDescription = `${availableVehicles} vehicles available out of ${vehicles.length || 0}`;

  return (
    <div>
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
        <BookingsList upcomingBookings={upcomingBookings} pastBookings={pastBookings} />
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
    </div>
  );
}
