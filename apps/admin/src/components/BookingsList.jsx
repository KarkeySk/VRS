import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BookingCard from "@/components/BookingCard";
import { upcomingBookings, pastBookings } from "@/lib/data";

export default function BookingsList() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const bookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div>
      {/* Tabs + Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 border-b border-dark-border">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`relative pb-2 bg-transparent border-none cursor-pointer text-sm transition-colors ${
              activeTab === "upcoming"
                ? "tab-active text-txt-primary font-medium"
                : "text-txt-secondary hover:text-txt-primary"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`relative pb-2 bg-transparent border-none cursor-pointer text-sm transition-colors ${
              activeTab === "past"
                ? "tab-active text-txt-primary font-medium"
                : "text-txt-secondary hover:text-txt-primary"
            }`}
          >
            Past Trips
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-dark-border text-txt-secondary rounded-md text-xs cursor-pointer transition-all hover:border-brand-orange hover:text-brand-orange">
          FILTER BY STATUS
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
