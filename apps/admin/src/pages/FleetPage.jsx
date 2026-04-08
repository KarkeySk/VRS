import { Search, Filter, Download, Truck, Link2, ShieldCheck, MapPin, Clock } from "lucide-react";
import { fleetVehicles } from "@/lib/data";

const statusStyles = {
  "Available": "bg-status-green/20 text-status-green",
  "Maintenance": "bg-status-yellow/20 text-status-yellow",
  "On Expedition": "bg-brand-orange/20 text-brand-orange",
  "Compliance Alert": "bg-status-red/20 text-status-red",
};

const bluebookStyles = {
  "VALID": "text-status-green",
  "EXPIRES SOON": "text-status-red",
  "EXPIRED": "text-status-red",
};

export default function FleetPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Fleet Overview</h2>
      <p className="text-sm text-txt-secondary mb-6">Real-time status of your high-altitude fleet in Kathmandu.</p>

      <div className="flex justify-end mb-6">
        <span className="flex items-center gap-2 px-3 py-1.5 border border-dark-border rounded-md text-xs text-txt-secondary">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          Live Updates Enabled
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center relative">
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-brand-orange/20 text-brand-orange rounded-full font-semibold">+4 this month</span>
          <Truck className="w-8 h-8 mx-auto mb-3 text-brand-orange" />
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Total Fleet</p>
          <p className="text-4xl font-bold">124</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center relative">
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-brand-orange/20 text-brand-orange rounded-full font-semibold">89% Utilization</span>
          <Link2 className="w-8 h-8 mx-auto mb-3 text-brand-orange" />
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Active Rentals</p>
          <p className="text-4xl font-bold">89</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center relative">
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-brand-orange/20 text-brand-orange rounded-full font-semibold">3 pending</span>
          <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-brand-orange" />
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Compliance Status</p>
          <p className="text-4xl font-bold">98.2%</p>
        </div>
      </div>

      {/* Vehicle Inventory Table */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Inventory Pipeline</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
              <input
                type="text"
                placeholder="Search plate or model..."
                className="bg-dark border border-dark-border rounded-md pl-9 pr-4 py-1.5 text-xs text-txt-primary placeholder-txt-secondary w-48"
              />
            </div>
            <button className="text-xs text-txt-secondary hover:text-brand-orange transition-colors flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button className="text-xs text-txt-secondary hover:text-brand-orange transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
              <th className="pb-3 font-semibold">Vehicle Details</th>
              <th className="pb-3 font-semibold">Plate Number</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Bluebook Expiry</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fleetVehicles.map((v, i) => (
              <tr key={v.id} className={i < fleetVehicles.length - 1 ? "border-b border-dark-border/50" : ""}>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-border flex items-center justify-center">
                      <Truck className="w-5 h-5 text-txt-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{v.name}</p>
                      <p className="text-xs text-txt-secondary">{v.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="text-txt-secondary">{v.plate}</td>
                <td>
                  <span className={`px-2 py-1 ${statusStyles[v.status]} text-xs rounded font-semibold`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <span className="text-sm">{v.bluebookExpiry}</span>
                  <br />
                  <span className={`text-xs ${bluebookStyles[v.bluebookStatus]} font-semibold`}>{v.bluebookStatus}</span>
                </td>
                <td className="text-txt-secondary cursor-pointer">⋮</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
          <p className="text-xs text-txt-secondary">Showing 1 to 4 of 124 vehicles</p>
          <div className="flex gap-1">
            <span className="w-7 h-7 flex items-center justify-center rounded text-xs text-txt-secondary cursor-pointer">‹</span>
            <span className="w-7 h-7 flex items-center justify-center rounded text-xs bg-brand-orange text-dark font-bold">1</span>
            <span className="w-7 h-7 flex items-center justify-center rounded text-xs text-txt-secondary cursor-pointer">2</span>
            <span className="w-7 h-7 flex items-center justify-center rounded text-xs text-txt-secondary cursor-pointer">3</span>
            <span className="w-7 h-7 flex items-center justify-center rounded text-xs text-txt-secondary cursor-pointer">›</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Expedition Prep + Seasonal Insights */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Expedition Prep */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop"
            alt="Himalayan Expedition"
            className="w-full h-40 object-cover"
          />
          <div className="p-6">
            <h3 className="text-base font-semibold mb-2">Planning Expedition Prep</h3>
            <p className="text-xs text-txt-secondary leading-relaxed mb-4">
              Pre-route vehicle inspections, fuel calculations, and altitude-specific gear allocation for upcoming expeditions across the Himalayan corridor.
            </p>
            <div className="flex items-center gap-4 text-xs text-txt-secondary">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> 12 Routes Active
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Next: Apr 5
              </span>
            </div>
            <button className="btn-action mt-4 px-5 py-2.5 text-sm">Expedition Details</button>
          </div>
        </div>

        {/* Seasonal Insights */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl overflow-hidden flex flex-col">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mt-6 rounded-full bg-brand-orange/20 border-2 border-brand-orange flex items-center justify-center">
              <svg className="w-12 h-12 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-base font-semibold mb-2">Seasonal Insights</h3>
            <p className="text-xs text-txt-secondary leading-relaxed mb-4">
              Peak season demand analytics and fleet optimization recommendations based on historical expedition data and weather patterns.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-dark-deeper rounded-lg p-3 text-center">
                <p className="text-[10px] text-txt-secondary uppercase tracking-wider mb-1">Peak Month</p>
                <p className="text-sm font-bold text-brand-orange">October</p>
              </div>
              <div className="bg-dark-deeper rounded-lg p-3 text-center">
                <p className="text-[10px] text-txt-secondary uppercase tracking-wider mb-1">Avg Revenue</p>
                <p className="text-sm font-bold text-brand-orange">NPR 2.4M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
