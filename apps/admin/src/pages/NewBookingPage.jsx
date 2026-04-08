import { useState } from "react";
import {
  CalendarDays,
  User,
  MapPin,
  Shield,
  CreditCard,
  Bike,
  Clock,
  ChevronDown,
  Upload,
  Navigation,
  Thermometer,
} from "lucide-react";

const vehicleOptions = [
  { id: "re-him", name: "Royal Enfield Himalayan 450", plate: "BA-2-CHA-4482", rate: "NPR 8,500/day" },
  { id: "honda-crf", name: "Honda CRF 250L", plate: "BA-1-KHA-9921", rate: "NPR 6,200/day" },
  { id: "ducati-dx", name: "Ducati DesertX", plate: "BA-3-YA-1256", rate: "NPR 15,000/day" },
  { id: "ktm-adv", name: "KTM Adventure 390", plate: "BA-2-KHA-6843", rate: "NPR 7,800/day" },
  { id: "yamaha-t7", name: "Yamaha Tenere 700", plate: "BA-1-GA-3301", rate: "NPR 12,000/day" },
];

const routeOptions = [
  { id: "annapurna", name: "Annapurna Circuit", duration: "12-16 days", difficulty: "Moderate" },
  { id: "mustang", name: "Upper Mustang", duration: "8-10 days", difficulty: "Challenging" },
  { id: "manang", name: "Manang Valley", duration: "5-7 days", difficulty: "Easy" },
  { id: "everest", name: "Everest Base Camp Route", duration: "14-18 days", difficulty: "Hard" },
  { id: "custom", name: "Custom Route", duration: "Flexible", difficulty: "Varies" },
];

const extraAddons = [
  { id: "offroad", label: "Off-Road Pack", price: "NPR 3,500", icon: Bike },
  { id: "helmet", label: "Extra Helmet", price: "NPR 500", icon: Shield },
  { id: "gps", label: "GPS Navigation", price: "NPR 1,200", icon: Navigation },
  { id: "insurance", label: "Full Insurance", price: "NPR 4,000", icon: Shield },
  { id: "camping", label: "Camping Gear", price: "NPR 5,500", icon: Thermometer },
  { id: "luggage", label: "Premium Luggage", price: "NPR 2,000", icon: Upload },
];

export default function NewBookingPage({ onNavigate }) {
  const [bookingType, setBookingType] = useState("self-drive");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">New Booking</h2>
        <span className="text-sm text-txt-secondary">Expedition Reservation</span>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left: Main Form */}
        <div className="space-y-6">
          {/* Booking Type */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Bike className="w-4 h-4 text-brand-orange" /> Booking Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBookingType("self-drive")}
                className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all ${
                  bookingType === "self-drive"
                    ? "border-brand-orange bg-brand-orange/10"
                    : "border-dark-border bg-transparent hover:border-brand-orange/50"
                }`}
              >
                <Bike className={`w-8 h-8 mx-auto mb-2 ${bookingType === "self-drive" ? "text-brand-orange" : "text-txt-secondary"}`} />
                <p className={`text-sm font-semibold ${bookingType === "self-drive" ? "text-brand-orange" : "text-txt-secondary"}`}>Self-Drive</p>
                <p className="text-[10px] text-txt-muted mt-1">Customer drives the motorcycle</p>
              </button>
              <button
                onClick={() => setBookingType("with-driver")}
                className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all ${
                  bookingType === "with-driver"
                    ? "border-brand-orange bg-brand-orange/10"
                    : "border-dark-border bg-transparent hover:border-brand-orange/50"
                }`}
              >
                <User className={`w-8 h-8 mx-auto mb-2 ${bookingType === "with-driver" ? "text-brand-orange" : "text-txt-secondary"}`} />
                <p className={`text-sm font-semibold ${bookingType === "with-driver" ? "text-brand-orange" : "text-txt-secondary"}`}>With Driver</p>
                <p className="text-[10px] text-txt-muted mt-1">Guided expedition with a pro driver</p>
              </button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" /> Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", placeholder: "e.g. Rajesh Hamal", type: "text" },
                { label: "Phone Number", placeholder: "e.g. +977 9841xxxxxx", type: "tel" },
                { label: "Email Address", placeholder: "e.g. customer@email.com", type: "email" },
                { label: "Nationality", placeholder: "e.g. Nepali", type: "text" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs text-txt-secondary mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
            {bookingType === "self-drive" && (
              <div className="mt-4">
                <label className="text-xs text-txt-secondary mb-1.5 block">License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-2024-KTM-XXXXX"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
            )}
            {bookingType === "with-driver" && (
              <div className="mt-4">
                <label className="text-xs text-txt-secondary mb-1.5 block">Preferred Guide / Driver</label>
                <div className="relative">
                  <select className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary appearance-none focus:border-brand-orange focus:outline-none transition-colors cursor-pointer">
                    <option value="">Select a guide (optional)</option>
                    <option value="karma">Karma Sherpa — Annapurna Specialist</option>
                    <option value="raj">Raj Thapa — Mustang Expert</option>
                    <option value="tenzing">Tenzing Lama — High-Altitude Pro</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Selection */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Bike className="w-4 h-4 text-brand-orange" /> Vehicle Selection
            </h3>
            <div className="space-y-2">
              {vehicleOptions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all text-left ${
                    selectedVehicle === v.id
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-dark-border bg-dark-deeper hover:border-brand-orange/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedVehicle === v.id ? "bg-brand-orange/20" : "bg-dark-border"}`}>
                      <Bike className={`w-4 h-4 ${selectedVehicle === v.id ? "text-brand-orange" : "text-txt-secondary"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${selectedVehicle === v.id ? "text-brand-orange" : "text-txt-primary"}`}>{v.name}</p>
                      <p className="text-xs text-txt-secondary">{v.plate}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${selectedVehicle === v.id ? "text-brand-orange" : "text-txt-secondary"}`}>{v.rate}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand-orange" /> Trip Details
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Pickup Date</label>
                <input
                  type="date"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Return Date</label>
                <input
                  type="date"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Pickup Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pokhara Lakeside Hub"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Drop-off Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu Thamel Office"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Route Selection */}
            <label className="text-xs text-txt-secondary mb-2 block">Expedition Route</label>
            <div className="grid grid-cols-2 gap-2">
              {routeOptions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoute(r.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedRoute === r.id
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-dark-border bg-dark-deeper hover:border-brand-orange/40"
                  }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 ${selectedRoute === r.id ? "text-brand-orange" : "text-txt-secondary"}`} />
                  <div>
                    <p className={`text-xs font-semibold ${selectedRoute === r.id ? "text-brand-orange" : "text-txt-primary"}`}>{r.name}</p>
                    <p className="text-[10px] text-txt-muted">{r.duration} · {r.difficulty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add-Ons & Extras */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-orange" /> Add-Ons & Extras
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {extraAddons.map((addon) => {
                const Icon = addon.icon;
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`border-2 rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange/10"
                        : "border-dark-border bg-transparent hover:border-brand-orange/50"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1.5 ${isSelected ? "text-brand-orange" : "text-txt-secondary"}`} />
                    <p className={`text-xs font-semibold ${isSelected ? "text-brand-orange" : "text-txt-primary"}`}>{addon.label}</p>
                    <p className="text-[10px] text-txt-muted mt-0.5">{addon.price}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-orange" /> Payment & Notes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Payment Method</label>
                <div className="relative">
                  <select className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary appearance-none focus:border-brand-orange focus:outline-none transition-colors cursor-pointer">
                    <option value="cash">Cash on Pickup</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="esewa">eSewa</option>
                    <option value="khalti">Khalti</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Deposit Amount (NPR)</label>
                <input
                  type="text"
                  placeholder="e.g. 10,000"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-txt-secondary mb-1.5 block">Special Requests / Notes</label>
              <textarea
                placeholder="Any special requirements for this expedition..."
                rows={3}
                className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => onNavigate("dashboard")}
              className="text-sm text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Cancel
            </button>
            <button className="btn-action px-8 py-2.5 text-sm">Confirm Booking</button>
          </div>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-4">
          {/* Booking Checklist */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Booking Checklist</h4>
            <div className="space-y-2">
              {[
                { step: "Booking Type", done: true },
                { step: "Customer Info", done: false },
                { step: "Vehicle Selection", done: selectedVehicle !== "" },
                { step: "Trip Details", done: selectedRoute !== "" },
                { step: "Add-Ons", done: selectedAddons.length > 0 },
                { step: "Payment & Notes", done: false },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.done
                        ? "bg-brand-orange text-dark"
                        : "border border-dark-border text-txt-secondary"
                    }`}
                  >
                    {item.done ? "✓" : i + 1}
                  </span>
                  <span className={item.done ? "text-brand-orange" : "text-txt-secondary"}>{item.step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Stats */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-2">Active Bookings</h4>
            <p className="text-3xl font-bold text-brand-orange mb-1">24</p>
            <p className="text-xs text-txt-secondary">Ongoing expeditions</p>
            <div className="w-full h-2 bg-dark-deeper rounded-full overflow-hidden mt-3">
              <div className="h-full bg-brand-orange rounded-full" style={{ width: "65%" }} />
            </div>
            <p className="text-[10px] text-txt-secondary mt-1">65% fleet utilization</p>
          </div>

          {/* Pricing Preview */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Pricing Preview</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-txt-secondary">
                <span>Vehicle Rental</span>
                <span>{selectedVehicle ? vehicleOptions.find((v) => v.id === selectedVehicle)?.rate || "—" : "—"}</span>
              </div>
              <div className="flex justify-between text-txt-secondary">
                <span>Add-Ons ({selectedAddons.length})</span>
                <span>{selectedAddons.length > 0 ? `${selectedAddons.length} selected` : "—"}</span>
              </div>
              <div className="border-t border-dark-border pt-2 flex justify-between font-bold text-sm">
                <span>Estimated Total</span>
                <span className="text-brand-orange">TBD</span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-2">Booking Tips</h4>
            <ul className="text-xs text-txt-secondary space-y-2 m-0 pl-4">
              <li>Verify customer ID before confirming</li>
              <li>Check vehicle availability for selected dates</li>
              <li>Full insurance recommended for high-altitude routes</li>
              <li>Collect deposit before handover</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
