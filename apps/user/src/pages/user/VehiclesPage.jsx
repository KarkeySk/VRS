import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Shield, CloudRain } from 'lucide-react';
import { useVehicles } from '../../hooks/useVehicles';
import { normalizeVehicle } from '../../utils/vehicleMapper';
export default function VehiclesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const terrainParam = searchParams.get('terrain') || '';
    const wheelsParam = searchParams.get('wheels') || 'all';
    const [filter, setFilter] = useState(terrainParam || 'All Terrain');
    const [wheelsFilter, setWheelsFilter] = useState(wheelsParam);
    const [sortHighToLow, setSortHighToLow] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const { vehicles: dbVehicles, loading } = useVehicles();
    const vehicles = dbVehicles.map(normalizeVehicle);

    const filteredVehicles = vehicles
        .filter(v => {
            const matchesSearch = !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === 'All Terrain' || v.category === filter;
            const isTwoWheeler = v.type === 'bike' || (v.capacity || '').toLowerCase().includes('2 seats');
            const matchesWheels = wheelsFilter === 'all'
                || (wheelsFilter === 'two' && isTwoWheeler)
                || (wheelsFilter === 'four' && !isTwoWheeler);
            return matchesSearch && matchesFilter && matchesWheels;
        })
        .sort((a, b) => sortHighToLow ? b.price - a.price : a.price - b.price);


    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '80px', background: 'var(--bg-primary)' }}>
            <div className="container" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '0', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-glass)', padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Camp</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>5,364m</div>
                    </div>
                </div>

                <div className="section-label" style={{ color: '#e8732a', letterSpacing: '2px', fontWeight: '600' }}>FLEET DISCOVERY</div>
                <h1 className="section-title" style={{ marginBottom: '16px', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', lineHeight: 1 }}>Bhatbhati:<br/>Choose Your Ride</h1>
                <p style={{ color: '#a0a0a0', fontSize: '1.125rem', maxWidth: '500px', marginBottom: '40px', lineHeight: 1.5 }}>
                    Choose from vehicles made for city roads and mountain roads.
                </p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ background: showFilters ? 'linear-gradient(to right, #fcab73, #e8732a)' : 'rgba(255,255,255,0.05)', border: showFilters ? 'none' : '1px solid rgba(255,255,255,0.1)', color: showFilters ? '#000' : '#fff', padding: '10px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        Filters {showFilters ? '✕' : ''}
                    </button>
                    {showFilters && ['All Terrain', 'Ice Peaks', 'Valley Passes'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)', 
                                color: filter === f ? '#fff' : '#888', 
                                padding: '10px 24px', 
                                borderRadius: '30px', 
                                fontWeight: '500', 
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}

                    {showFilters && ['all', 'four', 'two'].map((w) => (
                        <button
                            key={w}
                            onClick={() => setWheelsFilter(w)}
                            style={{
                                background: wheelsFilter === w ? 'rgba(232,115,42,0.2)' : 'transparent',
                                border: wheelsFilter === w ? '1px solid rgba(232,115,42,0.55)' : '1px solid rgba(255,255,255,0.1)',
                                color: wheelsFilter === w ? '#ffd2b1' : '#888',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                            }}
                        >
                            {w === 'all' ? 'All Wheels' : `${w} Wheeler`}
                        </button>
                    ))}
                    
                    <div style={{ flex: 1 }}></div>
                    <button 
                        onClick={() => setSortHighToLow(!sortHighToLow)}
                        style={{ background: sortHighToLow ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 24px', borderRadius: '30px', fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Price: {sortHighToLow ? 'High to Low' : 'Low to High'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: sortHighToLow ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>
                
                {loading ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading vehicles...</p>
                ) : (
                <div className="fleet-grid">
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle.id} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'transform 0.3s, background 0.3s' }} onClick={() => navigate(`/vehicles/${vehicle.id}`)} onMouseOver={(e) => e.currentTarget.style.background = '#1a1a1a'} onMouseOut={(e) => e.currentTarget.style.background = '#111'}>
                            <div style={{ overflow: 'hidden', height: '240px', borderRadius: '16px', position: 'relative', marginBottom: '20px' }}>
                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.625rem', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg> {vehicle.altitude?.target} RATED
                                </div>
                                <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #111 0%, transparent 50%)' }} />
                            </div>
                            <div style={{ padding: '0 8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{vehicle.name}</h3>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>${vehicle.price}</div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>PER DAY</div>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Good for long and rough roads</p>
                                
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                                    <span style={{ background: 'var(--bg-glass)', color: '#a0a0a0', fontSize: '0.625rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 12px', borderRadius: '20px' }}>MOUNTAIN READY</span>
                                    <span style={{ background: 'var(--bg-glass)', color: '#a0a0a0', fontSize: '0.625rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 12px', borderRadius: '20px' }}>LONG TRIP READY</span>
                                </div>

                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/9779800000000?text=I'm interested in the ${vehicle.name}`, '_blank'); }} style={{ width: '100%', padding: '14px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'var(--accent-ink)', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                    Ask on WhatsApp <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Mountain Conditions Widget at the bottom */}
                <div style={{ marginTop: '60px', background: 'linear-gradient(180deg, rgba(25,25,25,0.8) 0%, rgba(15,15,15,0.8) 100%)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '60px auto 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CloudRain size={32} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>Road Weather</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Live stats for Mustang Highway</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>TEMP</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>-12°C</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>WIND</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>45km/h</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>VIS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>Low</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>PASS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>OPEN</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
