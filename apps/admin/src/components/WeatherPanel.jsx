import { Cloud, MapPin } from "lucide-react";

export default function WeatherPanel() {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      <h3 className="text-base font-semibold m-0 mb-4">Weather Outlook</h3>
      <div className="flex items-center gap-4 mb-3">
        <Cloud className="w-12 h-12 text-txt-secondary" />
        <div>
          <p className="text-3xl font-bold m-0">12°C</p>
          <p className="text-[13px] text-txt-secondary m-0">Clear skies over Pokhara</p>
        </div>
      </div>
      <p className="text-[13px] text-txt-secondary mt-3 m-0 leading-relaxed">
        Perfect conditions for high-altitude biking. Minimal wind expected for the next 48 hours.
      </p>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-border">
        <span className="flex items-center gap-1.5 text-xs text-txt-secondary">
          <MapPin className="w-3.5 h-3.5" />
          8 km/h NE
        </span>
        <span className="flex items-center gap-1.5 text-xs text-txt-secondary">
          <span className="w-2 h-2 rounded-full bg-status-green inline-block" />
          Visibility: Excellent
        </span>
      </div>
    </div>
  );
}
