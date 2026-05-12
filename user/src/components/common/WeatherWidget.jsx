import { useEffect, useState } from 'react';
import { Cloud, Wind, Eye, MapPin, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { weatherService } from '@bhatbhati/shared/services/weatherService.js';

const weatherIcons = {
    'Clear skies': Sun,
    'Partly cloudy': Cloud,
    'Foggy': CloudFog,
    'Drizzle': CloudDrizzle,
    'Rain showers': CloudRain,
    'Snow showers': CloudSnow,
    'Thunderstorm': CloudLightning,
    'Variable weather': Cloud,
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await weatherService.getCurrent();
                if (mounted) { setWeather(data); setLoading(false); }
            } catch {
                if (mounted) setLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 60000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    const WeatherIcon = weather ? (weatherIcons[weather.summary] || Cloud) : Cloud;

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: '22px', border: '1px solid var(--border)',
            padding: '28px', position: 'relative', overflow: 'hidden',
        }}>
            {/* Subtle gradient background */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '180px', height: '180px',
                background: 'radial-gradient(circle at top right, rgba(96,165,250,0.06), transparent)',
                borderRadius: '0 22px 0 0',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '16px',
                }}>Live Weather</div>

                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading forecast...</div>
                ) : weather ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <WeatherIcon size={28} color="#60a5fa" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {weather.temperatureC}°C
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600', marginTop: '2px' }}>
                                    {weather.summary}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                            marginBottom: '16px',
                        }}>
                            {weather.recommendation}
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
                            padding: '14px 0 0', borderTop: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={12} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{weather.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Wind size={12} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{weather.windText}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Eye size={12} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{weather.visibility}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Weather unavailable</div>
                )}
            </div>
        </div>
    );
}
