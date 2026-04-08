const DEFAULT_LOCATION = {
  name: 'Pokhara',
  latitude: 28.2096,
  longitude: 83.9856,
}

function toNumber(value, fallback) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function getLocationConfig() {
  const latitude = toNumber(import.meta.env.VITE_WEATHER_LAT, DEFAULT_LOCATION.latitude)
  const longitude = toNumber(import.meta.env.VITE_WEATHER_LON, DEFAULT_LOCATION.longitude)
  const name = import.meta.env.VITE_WEATHER_LOCATION?.trim() || DEFAULT_LOCATION.name

  return { latitude, longitude, name }
}

function codeToSummary(code) {
  if (code === 0) return 'Clear skies'
  if ([1, 2, 3].includes(code)) return 'Partly cloudy'
  if ([45, 48].includes(code)) return 'Foggy'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain showers'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow showers'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Variable weather'
}

function windDirectionLabel(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const normalized = ((Number(degrees) % 360) + 360) % 360
  const idx = Math.round(normalized / 45) % 8
  return dirs[idx]
}

function visibilityLabel(meters) {
  if (!Number.isFinite(meters)) return 'Visibility unavailable'
  if (meters >= 10000) return 'Excellent'
  if (meters >= 5000) return 'Good'
  if (meters >= 2000) return 'Moderate'
  return 'Limited'
}

function recommendation(summary, windKmh) {
  if (summary === 'Thunderstorm') return 'Storm risk detected. Delay high-altitude rides until conditions stabilize.'
  if (summary === 'Rain showers' || summary === 'Snow showers') {
    return 'Trails may be slippery. Recommend cautious operation and reduced speed.'
  }
  if (windKmh >= 30) return 'Strong winds expected. Prioritize experienced riders and safety checks.'
  return 'Suitable operating conditions with normal safety protocol.'
}

export const weatherService = {
  getCurrent: async () => {
    const location = getLocationConfig()
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: [
        'temperature_2m',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'visibility',
      ].join(','),
      timezone: 'auto',
    })

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Weather API failed: ${response.status}`)
    }

    const payload = await response.json()
    const current = payload?.current
    if (!current) {
      throw new Error('Weather API returned no current weather data')
    }

    const summary = codeToSummary(Number(current.weather_code))
    const windKmh = Math.round(Number(current.wind_speed_10m) || 0)
    const windDir = windDirectionLabel(Number(current.wind_direction_10m))
    const visibility = visibilityLabel(Number(current.visibility))

    return {
      location: location.name,
      temperatureC: Math.round(Number(current.temperature_2m) || 0),
      summary,
      subtitle: `${summary} over ${location.name}`,
      recommendation: recommendation(summary, windKmh),
      windText: `${windKmh} km/h ${windDir}`,
      visibility,
      updatedAt: current.time || new Date().toISOString(),
    }
  },
}
