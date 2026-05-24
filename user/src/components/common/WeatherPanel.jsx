import { useEffect, useMemo, useState } from "react";
import { Cloud, MapPin, Search, X } from "lucide-react";
import { weatherService } from "@bhatbhati/shared/services/weatherService.js";

// Common Nepal locations for quick access
const PRESET_LOCATIONS = [
  { name: "Kathmandu", lat: 27.7172, lon: 85.3240 },
  { name: "Pokhara", lat: 28.2096, lon: 83.9856 },
  { name: "Biratnagar", lat: 26.4667, lon: 87.2833 },
  { name: "Bhaktapur", lat: 27.6700, lon: 85.8130 },
  { name: "Dhulikhel", lat: 27.6168, lon: 85.4168 },
  { name: "Janakpur", lat: 26.7289, lon: 85.9242 },
  { name: "Chitwan", lat: 27.5371, lon: 84.8126 },
  { name: "Rara Lake", lat: 29.3854, lon: 82.1256 },
];

export default function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Pokhara",
    lat: 28.2096,
    lon: 83.9856,
  });
  const [filteredLocations, setFilteredLocations] = useState([]);

  // Fetch weather when location changes
  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          latitude: String(selectedLocation.lat),
          longitude: String(selectedLocation.lon),
          current: [
            "temperature_2m",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "visibility",
          ].join(","),
          timezone: "auto",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`Weather API failed: ${response.status}`);
        }

        const payload = await response.json();
        const current = payload?.current;
        if (!current) {
          throw new Error("No weather data");
        }

        const summary = codeToSummary(Number(current.weather_code));
        const windKmh = Math.round(Number(current.wind_speed_10m) || 0);
        const windDir = windDirectionLabel(Number(current.wind_direction_10m));
        const visibility = visibilityLabel(Number(current.visibility));

        if (isMounted) {
          setWeather({
            location: selectedLocation.name,
            temperatureC: Math.round(Number(current.temperature_2m) || 0),
            summary,
            windText: `${windKmh} km/h ${windDir}`,
            visibility,
            updatedAt: current.time || new Date().toISOString(),
          });
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Unable to load weather");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWeather();
    // Poll every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedLocation]);

  // Filter locations based on search input
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredLocations([]);
      return;
    }

    const query = searchInput.toLowerCase();
    const filtered = PRESET_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(query)
    );
    setFilteredLocations(filtered);
  }, [searchInput]);

  const updatedLabel = useMemo(() => {
    if (!weather?.updatedAt) return "";
    const date = new Date(weather.updatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return `Updated ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [weather?.updatedAt]);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchInput("");
    setShowSearch(false);
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Header with search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Weather
        </h3>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = "var(--text-primary)";
            e.target.style.color = "var(--text-primary)";
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.color = "var(--text-secondary)";
          }}
        >
          {showSearch ? (
            <X style={{ width: "16px", height: "16px" }} />
          ) : (
            <Search style={{ width: "16px", height: "16px" }} />
          )}
        </button>
      </div>

      {/* Location Search */}
      {showSearch && (
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <input
            type="text"
            placeholder="Search location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
            }}
          />
          {filteredLocations.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelectLocation(loc)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    textAlign: "left",
                    border: "none",
                    background:
                      selectedLocation.name === loc.name
                        ? "var(--accent-subtle)"
                        : "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    borderBottom: "1px solid var(--border)",
                    transition: "all 0.15s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "var(--bg-glass-hover)";
                    e.target.style.color = "var(--text-primary)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background =
                      selectedLocation.name === loc.name
                        ? "var(--accent-subtle)"
                        : "transparent";
                    e.target.style.color = "var(--text-secondary)";
                  }}
                >
                  <MapPin
                    style={{
                      width: "14px",
                      height: "14px",
                      marginRight: "8px",
                      display: "inline",
                    }}
                  />
                  {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weather Display */}
      {loading ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Loading weather...
        </div>
      ) : error ? (
        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          {error}
        </div>
      ) : weather ? (
        <>
          {/* Current Weather */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Cloud
                style={{
                  width: "28px",
                  height: "28px",
                  color: "var(--accent)",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {weather.temperatureC}°C
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--accent)",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                {weather.summary}
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 0 16px",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              marginBottom: "16px",
            }}
          >
            <MapPin
              style={{
                width: "14px",
                height: "14px",
                color: "var(--text-muted)",
              }}
            />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {weather.location}
            </span>
          </div>

          {/* Weather Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                Wind
              </span>
              <div style={{ fontWeight: "600", marginTop: "2px" }}>
                {weather.windText}
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                Visibility
              </span>
              <div style={{ fontWeight: "600", marginTop: "2px" }}>
                {weather.visibility}
              </div>
            </div>
          </div>

          {/* Updated time */}
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textAlign: "right",
            }}
          >
            {updatedLabel || "Updates every 30 minutes"}
          </div>
        </>
      ) : null}

      {/* Location Shortcuts */}
      {!showSearch && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            Quick Locations
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "6px",
            }}
          >
            {PRESET_LOCATIONS.slice(0, 4).map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleSelectLocation(loc)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border:
                    selectedLocation.name === loc.name
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
                  background:
                    selectedLocation.name === loc.name
                      ? "var(--accent-subtle)"
                      : "transparent",
                  color:
                    selectedLocation.name === loc.name
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseOver={(e) => {
                  if (selectedLocation.name !== loc.name) {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.color = "var(--accent)";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedLocation.name !== loc.name) {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.color = "var(--text-secondary)";
                  }
                }}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function codeToSummary(code) {
  if (code === 0) return "Clear skies";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain showers";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Variable weather";
}

function windDirectionLabel(degrees) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((Number(degrees) % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  return dirs[idx];
}

function visibilityLabel(meters) {
  if (!Number.isFinite(meters)) return "Unavailable";
  if (meters >= 10000) return "Excellent";
  if (meters >= 5000) return "Good";
  if (meters >= 2000) return "Moderate";
  return "Limited";
}
