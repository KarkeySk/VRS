import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js';
import { useVehicles } from '../../hooks/useVehicles';
import { normalizeVehicle } from '../../utils/vehicleMapper';
import {
    CloudRain, Settings, Unlock, Lock, Navigation, Droplet, 
    RefreshCw, Briefcase, Star, Wind, Snowflake, Map as MapIcon, Shield, Activity
} from 'lucide-react';

const icons = {
    Wind, Snowflake, Map: MapIcon, Shield, Activity, Settings, Unlock, Lock, Navigation, Droplet, RefreshCw, Briefcase
};

export default function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { vehicles: dbVehicles } = useVehicles()
    const relatedVehicles = dbVehicles.map(normalizeVehicle).filter((v) => v.id !== id)

    const [driveType, setDriveType] = useState('with-driver');
    const [selectedAddons, setSelectedAddons] = useState([]);

    useEffect(() => {
        let mounted = true
        const loadVehicle = async () => {
            setIsLoading(true)
            try {
                const data = await vehicleService.getById(id)
                if (mounted) setVehicle(normalizeVehicle(data))
            } catch {
                if (mounted) setVehicle(null)
            } finally {
                if (mounted) setIsLoading(false)
            }
        }
        loadVehicle()
        return () => { mounted = false }
    }, [id])

    if (isLoading) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <h2>Loading vehicle...</h2>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <h2>Vehicle not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/vehicles')} style={{ marginTop: '20px' }}>Back to Vehicles</button>
            </div>
        );
    }

    const toggleAddon = (addonId) => {
        setSelectedAddons((prev) => 
            prev.includes(addonId) 
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
        const addon = vehicle.addons.find((a) => a.id === addonId);
        return sum + (addon ? addon.price : 0);
    }, 0);

    const finalPrice = vehicle.price + addonsTotal + (driveType === 'with-driver' ? 20 : 0);

    return (
        <div style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* HERO SECTION */}
            <div style={{ position: 'relative', height: '65vh', minHeight: '500px', display: 'flex', alignItems: 'flex-end', paddingBottom: '60px' }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #111 5%, rgba(17, 17, 17, 0.4) 60%, rgba(17, 17, 17, 0.1) 100%)' }} />
                </div>
                
                <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232, 115, 42, 0.1)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.625rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px', border: '1px solid rgba(232, 115, 42, 0.1)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                            Ready to Book
                        </div>
                        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '800', lineHeight: 1, marginBottom: '16px', letterSpacing: '-0.04em' }}>{vehicle.name}</h1>
                        <p style={{ fontSize: '1.25rem', color: '#60a5fa', maxWidth: '420px', lineHeight: 1.4, fontWeight: '500' }}>{vehicle.subtitle}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CloudRain size={20} color="#888" />
                         </div>
                         <div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: '600' }}>Area Weather</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1 }}>-4°C</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ Clear Sky</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    
                    {/* LEFT COLUMN - DETAILS */}
                    <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
                        
                        {/* QUICK SPECS ROW */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '40px' }}>
                            <div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Engine</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{vehicle.engine}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Torque</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{vehicle.torque}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Drive</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{vehicle.drive}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Capacity</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{vehicle.capacity}</div>
                            </div>
                        </div>

                        {/* CAPABILITIES */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Key Features</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            {vehicle.capabilities.map((cap, i) => {
                                const IconComp = icons[cap.icon] || Settings;
                                return (
                                <div key={i} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--bg-glass)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <IconComp size={16} color="var(--accent)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9375rem' }}>{cap.title}</div>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{cap.desc}</p>
                                    </div>
                                </div>
                            )})}
                        </div>

                        {/* ALTITUDE TOLERANCE CHART */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Height Support</h3>
                        <div style={{ background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '40px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 1, height: '15%', background: '#0a1930', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                                <div style={{ flex: 1, height: '30%', background: '#0f294d', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                                <div style={{ flex: 1, height: '55%', background: '#133a6e', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                                <div style={{ flex: 1, height: '80%', background: '#1c5aa8', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                                <div style={{ flex: 1, height: '100%', background: '#b3d4ff', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.625rem', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>Target: {vehicle.altitude?.target || '5,416m'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <span>{vehicle.altitude?.milestones?.[0] || 'Kathmandu (1.4K)'}</span>
                                <span>{vehicle.altitude?.milestones?.[1] || 'Manang (3.5K)'}</span>
                                <span>{vehicle.altitude?.milestones?.[2] || 'Thorong La (5.4K)'}</span>
                            </div>
                        </div>

                        {/* TECHNICAL SPECS */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Tech Details</h3>
                        <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            {vehicle.technicalSpecs.map((spec, i) => (
                                <div key={i} style={{ display: 'flex', borderBottom: i !== vehicle.technicalSpecs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '16px 0', alignItems: 'center' }}>
                                    <div style={{ width: '250px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{spec.label}</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - BOOKING PANEL */}
                    <div style={{ flex: '1 1 35%', minWidth: '320px' }}>
                        <div style={{ position: 'sticky', top: '100px', background: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Price From</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
                                <div>
                                    <span style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--accent)', lineHeight: 1 }}>${finalPrice}</span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/day</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={14} fill={star <= Math.floor(vehicle.rating) ? 'var(--accent)' : 'none'} color={star <= Math.floor(vehicle.rating) ? 'var(--accent)' : '#444'} />
                                    ))}
                                </div>
                            </div>

                            {/* TABS */}
                            <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: '16px', padding: '4px', marginBottom: '32px' }}>
                                <button 
                                    onClick={() => setDriveType('with-driver')}
                                    style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '600', background: driveType === 'with-driver' ? 'rgba(255,255,255,0.1)' : 'transparent', color: driveType === 'with-driver' ? '#fff' : '#888', transition: 'all 0.3s', cursor: 'pointer', border: 'none' }}
                                >
                                    With Driver
                                </button>
                                <button 
                                    onClick={() => setDriveType('self-drive')}
                                    style={{ flex: 1, padding: '12px 0', borderRadius: '12px', fontSize: '0.8125rem', fontWeight: '600', background: driveType === 'self-drive' ? 'rgba(255,255,255,0.1)' : 'transparent', color: driveType === 'self-drive' ? '#fff' : '#888', transition: 'all 0.3s', cursor: 'pointer', border: 'none' }}
                                >
                                    Self-Drive
                                </button>
                            </div>

                            {/* ADD-ONS */}
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Extra Options</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {vehicle.addons.map((addon) => {
                                        const isSelected = selectedAddons.includes(addon.id);
                                        return (
                                            <div 
                                                key={addon.id} 
                                                onClick={() => toggleAddon(addon.id)}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}`, background: isSelected ? 'rgba(232, 115, 42, 0.05)' : '#161616', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `1px solid ${isSelected ? 'var(--accent)' : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--accent)' : 'transparent', transition: 'all 0.2s' }}>
                                                        {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem', color: isSelected ? '#fff' : '#a0a0a0' }}>{addon.name}</span>
                                                </div>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isSelected ? 'var(--accent)' : 'var(--accent)' }}>+${addon.price}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <button onClick={() => navigate(`/inquiry/${vehicle.id}`)} style={{ width: '100%', padding: '16px', fontSize: '0.875rem', letterSpacing: '0.5px', fontWeight: '700', background: 'var(--brand-gradient)', color: 'var(--accent-ink)', borderRadius: '30px', border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 25px rgba(232, 115, 42, 0.3)' }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(232, 115, 42, 0.5)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(232, 115, 42, 0.3)'; }}
                            >
                                BOOK THIS VEHICLE
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Free cancel up to 48h before trip
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="container">
                {/* EXPLORE MORE */}
                <div style={{ marginTop: '80px', paddingTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div style={{ color: 'var(--accent)', letterSpacing: '2px', fontWeight: '600', fontSize: '0.75rem', marginBottom: '8px' }}>MORE OPTIONS</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>Similar Vehicles</h2>
                        </div>
                        <button onClick={() => navigate('/vehicles')} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 24px', borderRadius: '30px', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>See All Vehicles</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {relatedVehicles.map(v => (
                            <div key={v.id} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'transform 0.3s, background 0.3s' }} onClick={() => { window.scrollTo(0,0); navigate(`/vehicles/${v.id}`); }} onMouseOver={(e) => e.currentTarget.style.background = '#1a1a1a'} onMouseOut={(e) => e.currentTarget.style.background = '#161616'}>
                                <div style={{ overflow: 'hidden', height: '200px', borderRadius: '16px', position: 'relative', marginBottom: '16px' }}>
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.625rem', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 2 }}>
                                        MAX {v.altitude?.target}
                                    </div>
                                    <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #161616 0%, transparent 50%)' }} />
                                </div>
                                <div style={{ padding: '0 8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{v.name}</h3>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent)' }}>${v.price}</div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
