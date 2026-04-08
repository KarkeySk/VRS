import { Zap, FileText, Cloud, AlertTriangle } from "lucide-react";
import { telemetryVehicles, serviceAlerts } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";
import { Zap, FileText, Cloud, AlertTriangle } from "lucide-react";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import { bookingService } from "@bhatbhati/shared/services/bookingService.js";
import { uiAssetService } from "@bhatbhati/shared/services/uiAssetService.js";

const severityStyles = {
  "URGENT": "bg-status-red/20 text-status-red",
  "2 DAYS": "bg-status-yellow/20 text-status-yellow",
  "INFO": "bg-[rgba(100,150,200,0.2)] text-[#64d4ff]",
};

export default function OperationsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [forecastImage, setForecastImage] = useState("");
  const [gridImage, setGridImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [vehicleData, bookingData, assets] = await Promise.all([
        vehicleService.getAllForAdmin(),
        bookingService.getAll(),
        uiAssetService.getMany(["admin_operations_forecast", "admin_operations_grid"]),
      ]);
      setVehicles(vehicleData ?? []);
      setBookings(bookingData ?? []);
      const assetMap = new Map((assets ?? []).map((a) => [a.asset_key, a.image_url]));
      setForecastImage(assetMap.get("admin_operations_forecast") || "");
      setGridImage(assetMap.get("admin_operations_grid") || "");
    } catch (err) {
      console.error("Failed to load operations:", err);
      setError(err.message || "Failed to load operations data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const telemetryVehicles = useMemo(() => vehicles.slice(0, 3).map((v, idx) => ({
    id: v.id,
    name: v.name,
    code: `#${String(idx + 101)}`,
    route: v.category || "Kathmandu Route",
    altitude: v.altitude?.target || "2,000m",
    engineTemp: `${65 + idx * 8}°C`,
    battery: 80 - (idx * 15),
    batteryColor: idx === 1 ? "bg-status-yellow" : "bg-status-green",
  })), [vehicles]);

  const serviceAlerts = useMemo(() => {
    const unavailable = vehicles.filter((v) => !v.is_available).slice(0, 3).map((v, idx) => ({
      id: v.id,
      title: "Vehicle Unavailable",
      description: `${v.name} · ${v.category || "Fleet"} status requires attention`,
      severity: idx === 0 ? "URGENT" : "2 DAYS",
    }));

    if (unavailable.length) return unavailable;

    return bookings.slice(0, 3).map((b, idx) => ({
      id: b.id,
      title: "Booking Follow-up",
      description: `${b.vehicles?.name || "Vehicle"} · ${b.status || "pending"} status`,
      severity: idx === 0 ? "INFO" : "2 DAYS",
    }));
  }, [vehicles, bookings]);

  const activeVehiclesCount = vehicles.filter((v) => v.is_available).length;

  const exportDailyLog = () => {
    if (!bookings.length) return
    const headers = ['booking_id', 'vehicle', 'status', 'start_date', 'end_date', 'total_price']
    const rows = bookings.map((b) => [
      b.id,
      b.vehicles?.name || 'Unknown Vehicle',
      b.status,
      b.start_date,
      b.end_date,
      b.total_price,
    ])
    const csv = [headers, ...rows]
      .map((cols) => cols.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-transit-log-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openMap = () => {
    window.open('https://www.google.com/maps/place/Mustang,+Nepal', '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-brand-orange">Operations & Logs</h2>
        <span className="text-sm text-txt-secondary">Admin Portal</span>
      </div>

        <span className="text-sm text-txt-secondary">Admin</span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="px-2.5 py-1 rounded border border-status-red/40 text-status-red text-[11px] font-semibold bg-transparent cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Row: Telemetry + Service Alerts */}
      <div className="grid grid-cols-[1fr_280px] gap-6 mb-6">
        {/* Live Telemetry */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold">Live Telemetry Feed</h3>
              <p className="text-xs text-txt-secondary">Real-time GPS and engine diagnostics across the Himalayan range</p>
            </div>
            <span className="px-3 py-1.5 bg-brand-orange/20 text-brand-orange text-xs rounded-full font-semibold">
              42 ACTIVE VEHICLES
              <h3 className="text-lg font-semibold">Live Vehicle Feed</h3>
              <p className="text-xs text-txt-secondary">Live GPS and engine info.</p>
            </div>
            <span className="px-3 py-1.5 bg-brand-orange/20 text-brand-orange text-xs rounded-full font-semibold">
              {activeVehiclesCount} ACTIVE
            </span>
          </div>
          <div className="space-y-4">
            {telemetryVehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-4 bg-dark-deeper rounded-lg p-4 border border-dark-border">
                <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs text-txt-secondary">{v.code} · Route: {v.route}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] text-txt-secondary uppercase">Altitude</p>
                  <p className="text-sm font-bold text-brand-orange">{v.altitude}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] text-txt-secondary uppercase">Engine Temp</p>
                  <p className="text-[10px] text-txt-secondary uppercase">Height</p>
                  <p className="text-sm font-bold text-brand-orange">{v.altitude}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] text-txt-secondary uppercase">Engine</p>
                  <p className="text-sm font-bold">{v.engineTemp}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-txt-secondary uppercase">Battery</span>
                  <div className="w-16 h-2 bg-dark-border rounded-full overflow-hidden">
                    <div className={`h-full ${v.batteryColor} rounded-full`} style={{ width: `${v.battery}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Service Alerts */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-status-red" /> Critical Service Alerts
            <Zap className="w-5 h-5 text-status-red" /> Important Alerts
          </h3>
          <div className="space-y-3">
            {serviceAlerts.map((alert) => (
              <div key={alert.id} className="bg-dark-deeper border border-dark-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{alert.title}</span>
                  <span className={`px-2 py-0.5 ${severityStyles[alert.severity]} text-[10px] rounded font-bold`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-txt-secondary">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-[1fr_280px] gap-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Daily Transit Logs */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-orange" /> Daily Transit Logs
            </h3>
            <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
              Generate standardized CSV/PDF reports for the Jomsom Police Checkpoint and Mustang Immigration Bureau.
            </p>
            <button className="btn-action px-5 py-2.5 text-sm flex items-center gap-1.5">
              Export Daily Log
            </button>
              <FileText className="w-4 h-4 text-brand-orange" /> Daily Logs
            </h3>
            <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
              Download today&apos;s booking list as CSV.
            </p>
            <button
              type="button"
              onClick={exportDailyLog}
              disabled={!bookings.length || isLoading}
              className="btn-action px-5 py-2.5 text-sm flex items-center gap-1.5"
            >
              {isLoading ? 'Loading...' : 'Download CSV'}
            </button>
            {!isLoading && !bookings.length && (
              <p className="text-[11px] text-txt-secondary mt-2">No bookings to export.</p>
            )}
          </div>

          {/* Area Forecast */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
              alt="Himalayan Area Forecast"
              className="w-full h-36 object-cover"
            />
            <div className="p-4">
              <h4 className="text-sm font-semibold mb-1">Area Forecast</h4>
              <p className="text-xs text-txt-secondary flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> -4°C Clear Skies
            {forecastImage ? (
              <img
                src={forecastImage}
                alt="Weather"
                className="w-full h-36 object-cover"
              />
            ) : (
              <div className="w-full h-36 bg-[linear-gradient(120deg,#253341_0%,#1d2733_55%,#0f172a_100%)]" />
            )}
            <div className="p-4">
              <h4 className="text-sm font-semibold mb-1">Weather</h4>
              <p className="text-xs text-txt-secondary flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> -4°C Clear
              </p>
            </div>
          </div>
        </div>

        {/* Right: Grid View + Stats */}
        <div className="space-y-4">
          <div className="bg-dark-deeper border border-dark-border rounded-xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=160&fit=crop"
              alt="Live Grid"
              className="w-full h-28 object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1 bg-dark/80 border border-dark-border rounded text-xs font-semibold uppercase tracking-wider">
                Live Grid View
              </span>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] text-txt-secondary uppercase">Mustang Region · Sector 4</p>
              <span className="text-xs text-brand-orange font-semibold cursor-pointer">OPEN FULL MAP</span>
            {gridImage ? (
              <img
                src={gridImage}
                alt="Map"
                className="w-full h-28 object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-28 bg-[linear-gradient(120deg,#253341_0%,#1d2733_55%,#0f172a_100%)]" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1 bg-dark/80 border border-dark-border rounded text-xs font-semibold uppercase tracking-wider">
                Live Map
              </span>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] text-txt-secondary uppercase">Mustang · Sector 4</p>
              <button
                type="button"
                onClick={openMap}
                className="text-xs text-brand-orange font-semibold cursor-pointer bg-transparent border-none"
              >
                OPEN MAP
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-4 text-center">
              <p className="text-[10px] text-txt-secondary uppercase tracking-wider mb-1">Efficiency</p>
              <p className="text-2xl font-bold text-brand-orange">94.2%</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-4 text-center">
              <p className="text-[10px] text-txt-secondary uppercase tracking-wider mb-1">CO2 Offset</p>
              <p className="text-2xl font-bold">1.2t</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
