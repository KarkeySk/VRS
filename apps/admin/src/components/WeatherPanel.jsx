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
import { useEffect, useMemo, useState } from "react";
import { Cloud, MapPin } from "lucide-react";
import { weatherService } from "@bhatbhati/shared/services/weatherService.js";

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        const data = await weatherService.getCurrent();
        if (!isMounted) return;
        setWeather(data);
        setError("");
      } catch (err) {
        console.error("Failed to load weather:", err);
        if (!isMounted) return;
        setError("Live weather unavailable");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWeather();
    const interval = setInterval(loadWeather, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const updatedLabel = useMemo(() => {
    if (!weather?.updatedAt) return "";
    const date = new Date(weather.updatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return `Updated ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, [weather?.updatedAt]);

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      <h3 className="text-base font-semibold m-0 mb-4">Weather</h3>
      <div className="flex items-center gap-4 mb-3">
        <Cloud className="w-12 h-12 text-txt-secondary" />
        <div>
          <p className="text-3xl font-bold m-0">
            {loading ? "--°C" : `${weather?.temperatureC ?? "--"}°C`}
          </p>
          <p className="text-[13px] text-txt-secondary m-0">
            {weather?.subtitle || "Getting weather..."}
          </p>
        </div>
      </div>
      <p className="text-[13px] text-txt-secondary mt-3 m-0 leading-relaxed">
        {weather?.recommendation || "Getting weather details for today."}
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
          {weather?.windText || "No wind data"}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-txt-secondary">
          <span className="w-2 h-2 rounded-full bg-status-green inline-block" />
          Visibility: {weather?.visibility || "Unknown"}
        </span>
      </div>
      <div className="mt-3 text-[11px] text-txt-muted">
        {error || updatedLabel || "Updates every 60 seconds"}
      </div>
    </div>
  );
}
