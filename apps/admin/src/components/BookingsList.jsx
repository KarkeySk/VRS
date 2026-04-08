import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BookingCard from "@/components/BookingCard";
import { upcomingBookings, pastBookings } from "@/lib/data";

export default function BookingsList() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const bookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

export default function BookingsList({
  upcomingBookings = [],
  pastBookings = [],
  onManageBooking = () => {},
}) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");

  const bookings = (activeTab === "upcoming" ? upcomingBookings : pastBookings)
    .filter((booking) => statusFilter === "all" || booking.status === statusFilter);

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
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-7 bg-transparent border border-dark-border text-txt-secondary rounded-md text-xs cursor-pointer transition-all hover:border-brand-orange hover:text-brand-orange"
          >
            <option value="all">ALL STATUSES</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-txt-secondary" />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        {bookings.length === 0 && (
          <div className="text-sm text-txt-secondary p-4 border border-dark-border rounded-lg">
            No bookings found.
          </div>
        )}
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onManage={() => onManageBooking(booking)} />
        ))}
      </div>
    </div>
  );
}
