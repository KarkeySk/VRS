import HeroBanner from "@/components/HeroBanner";
import CalendarPanel from "@/components/CalendarPanel";
import WeatherPanel from "@/components/WeatherPanel";
import BookingsList from "@/components/BookingsList";
import TrackingChart from "@/components/TrackingChart";
import StatsCard from "@/components/StatsCard";

export default function DashboardPage() {
  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Calendar/Weather + Bookings Grid */}
      <div className="grid grid-cols-[300px_1fr] gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-6">
          <CalendarPanel />
          <WeatherPanel />
        </div>

        {/* Right Column: Bookings */}
        <BookingsList />
      </div>

      {/* Tracking + Stats Row */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <TrackingChart />

        <div className="space-y-6">
          <StatsCard
            label="Driver Availability"
            value="82%"
            description="% of drivers currently deployed"
            progress={82}
          />
          <StatsCard
            label="Fleet Capacity"
            value="46%"
            description="12 vehicles available out of 26"
            progress={46}
            barColor="bg-[#3b82f6]"
          />
        </div>
      </div>
    </div>
  );
}
