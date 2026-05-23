import { useEffect, useMemo, useState } from "react";
import { Cloud, MapPin } from "lucide-react";
import { weatherService } from "@bhatbhati/shared/services/weatherService.js";

export default function WeatherPanel() {
  // Weather payload from the API.
  const [weather, setWeather] = useState(null);
  // Loading flag for UI placeholders.
  const [loading, setLoading] = useState(true);
  // Error message for the footer.
  const [error, setError] = useState("");

  useEffect(() => {
    // Guard to avoid state updates after unmount.
    let isMounted = true;

    const loadWeather = async () => {
      try {
        // Fetch the latest weather snapshot.
        const data = await weatherService.getCurrent();
        if (!isMounted) return;
        setWeather(data);
        setError("");
      } catch (err) {
        // Swallow errors and show a gentle message.
        console.error("Failed to load weather:", err);
        if (!isMounted) return;
        setError("Live weather unavailable");
      } finally {
        // Stop the loading state once a response lands.
        if (isMounted) setLoading(false);
      }
    };

    loadWeather();
    // Poll every minute for a fresh snapshot.
    const interval = setInterval(loadWeather, 60_000);

    return () => {
      // Cleanup interval and guard flag.
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const updatedLabel = useMemo(() => {
    // Human-readable label for the last update time.
    if (!weather?.updatedAt) return "";
    const date = new Date(weather.updatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return `Updated ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, [weather]);

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
