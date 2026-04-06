import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, Navigation, Thermometer, Wind } from 'lucide-react';

const regions = [
    {
        id: 'koshi',
        name: 'Koshi Province',
        label: 'Province 1',
        terrain: 'Ice Peaks',
        altitude: '8,848m',
        temp: '-26°C',
        routes: ['Everest Base Camp', 'Kanchenjunga Trek', 'Namche Bazaar'],
        districts: ['Solukhumbu', 'Taplejung', 'Ilam', 'Jhapa', 'Morang'],
        desc: 'Home to Mt. Everest. Extreme high-altitude terrain with ice, snow, and the world\'s toughest roads.',
        color: '#60a5fa',
        // SVG path for Province 1 (eastern Nepal)
        path: 'M580,60 L620,45 L660,55 L700,40 L720,60 L740,90 L730,130 L710,160 L690,200 L720,240 L700,280 L670,300 L640,290 L610,300 L580,280 L560,240 L570,200 L590,170 L600,140 L580,110 L570,80 Z',
    },
    {
        id: 'madhesh',
        name: 'Madhesh Province',
        label: 'Province 2',
        terrain: 'Valley Passes',
        altitude: '60m',
        temp: '38°C',
        routes: ['Janakpur Circuit', 'Rajbiraj Wetlands', 'Birgunj–Raxaul Corridor'],
        districts: ['Janakpur', 'Birgunj', 'Rajbiraj', 'Dhanusha'],
        desc: 'Flat Terai plains. Smooth highways and warm climate — ideal for comfortable valley drives.',
        color: '#34d399',
        path: 'M380,280 L420,290 L460,285 L500,290 L540,285 L580,280 L610,300 L640,290 L670,300 L660,330 L620,340 L580,335 L540,340 L500,335 L460,340 L420,335 L380,340 L360,320 L370,300 Z',
    },
    {
        id: 'bagmati',
        name: 'Bagmati Province',
        label: 'Province 3',
        terrain: 'All Terrain',
        altitude: '1,400m',
        temp: '22°C',
        routes: ['Kathmandu Valley', 'Nagarkot Sunrise', 'Langtang Valley', 'Helambu Trek'],
        districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Rasuwa', 'Sindhupalchok'],
        desc: 'Nepal\'s capital region. Mix of city roads, valley highways, and mountain trails leading to Langtang.',
        color: '#e8732a',
        path: 'M400,140 L430,120 L460,130 L490,115 L520,125 L540,150 L560,180 L570,200 L560,240 L540,260 L500,270 L460,265 L430,270 L400,260 L380,230 L370,200 L380,170 L390,150 Z',
    },
    {
        id: 'gandaki',
        name: 'Gandaki Province',
        label: 'Province 4',
        terrain: 'Ice Peaks',
        altitude: '8,167m',
        temp: '-18°C',
        routes: ['Annapurna Circuit', 'Upper Mustang', 'Pokhara Lakeside', 'Jomsom Highway'],
        districts: ['Kaski', 'Mustang', 'Manang', 'Lamjung', 'Gorkha'],
        desc: 'Annapurna and Mustang territory. Legendary off-road routes through the world\'s deepest gorge.',
        color: '#818cf8',
        path: 'M260,70 L300,55 L340,65 L370,50 L400,70 L400,140 L390,150 L380,170 L370,200 L380,230 L370,250 L340,260 L310,270 L280,260 L260,230 L250,200 L240,170 L250,130 L260,100 Z',
    },
    {
        id: 'lumbini',
        name: 'Lumbini Province',
        label: 'Province 5',
        terrain: 'Valley Passes',
        altitude: '150m',
        temp: '34°C',
        routes: ['Lumbini (Buddha Birthplace)', 'Palpa Hill Station', 'Siddhartha Highway'],
        districts: ['Rupandehi', 'Palpa', 'Kapilvastu', 'Dang', 'Banke'],
        desc: 'Southern plains with historic sites. Smooth highways and gentle hill roads perfect for valley exploration.',
        color: '#f59e0b',
        path: 'M200,220 L230,210 L260,230 L280,260 L310,270 L340,260 L370,250 L380,280 L370,300 L360,320 L380,340 L340,345 L300,340 L260,345 L230,335 L200,320 L190,290 L195,260 Z',
    },
    {
        id: 'karnali',
        name: 'Karnali Province',
        label: 'Province 6',
        terrain: 'All Terrain',
        altitude: '4,200m',
        temp: '-8°C',
        routes: ['Rara Lake', 'Dolpo Trek', 'Jumla–Humla Trail', 'Shey Phoksundo'],
        districts: ['Jumla', 'Dolpa', 'Humla', 'Mugu', 'Kalikot'],
        desc: 'Nepal\'s wildest frontier. Remote, rugged, minimal roads — only the toughest vehicles survive here.',
        color: '#f472b6',
        path: 'M120,55 L160,40 L200,50 L240,42 L260,70 L260,100 L250,130 L240,170 L250,200 L230,210 L200,220 L170,210 L140,200 L120,170 L110,130 L115,90 Z',
    },
    {
        id: 'sudurpashchim',
        name: 'Sudurpashchim Province',
        label: 'Province 7',
        terrain: 'All Terrain',
        altitude: '7,132m',
        temp: '-12°C',
        routes: ['Api Nampa Conservation', 'Khaptad National Park', 'Mahakali Corridor'],
        districts: ['Darchula', 'Baitadi', 'Bajhang', 'Kanchanpur', 'Kailali'],
        desc: 'Far-western Nepal. Unexplored mountain wilderness with challenging trails and border crossings.',
        color: '#a78bfa',
        path: 'M30,80 L60,55 L90,60 L120,55 L115,90 L110,130 L120,170 L140,200 L170,210 L200,220 L195,260 L190,290 L170,305 L140,310 L110,300 L80,290 L60,260 L40,220 L30,180 L25,140 L28,100 Z',
    },
];

export default function TerrainSelect() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(null);

    const activeRegion = regions.find((r) => r.id === (selected || hovered));

    const handleSelect = (regionId) => {
        setSelected(regionId);
    };

    const handleProceed = () => {
        if (!activeRegion) return;
        navigate(`/vehicles?terrain=${encodeURIComponent(activeRegion.terrain)}&region=${encodeURIComponent(activeRegion.name)}`);
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,115,42,0.1)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', color: '#e8732a', marginBottom: '16px', border: '1px solid rgba(232,115,42,0.15)' }}>
                        <MapPin size={12} /> SELECT YOUR DESTINATION
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                        Where in Nepal?
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                        Click on a province to explore routes and find the perfect vehicle for your terrain.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                    {/* Map */}
                    <div style={{ flex: '1 1 55%', minWidth: '350px' }}>
                        <div style={{
                            background: '#0c0c0c', borderRadius: '24px', padding: '24px',
                            border: '1px solid rgba(255,255,255,0.06)', position: 'relative',
                        }}>
                            <svg viewBox="0 0 760 380" style={{ width: '100%', height: 'auto' }}>
                                {/* Nepal outline glow */}
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>

                                {/* Province shapes */}
                                {regions.map((region) => {
                                    const isHovered = hovered === region.id;
                                    const isSelected = selected === region.id;
                                    const isActive = isHovered || isSelected;
                                    return (
                                        <g key={region.id}>
                                            <path
                                                d={region.path}
                                                fill={isActive ? region.color + '30' : 'rgba(255,255,255,0.04)'}
                                                stroke={isActive ? region.color : 'rgba(255,255,255,0.12)'}
                                                strokeWidth={isActive ? 2.5 : 1}
                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease', filter: isActive ? 'url(#glow)' : 'none' }}
                                                onMouseEnter={() => setHovered(region.id)}
                                                onMouseLeave={() => setHovered(null)}
                                                onClick={() => handleSelect(region.id)}
                                            />
                                        </g>
                                    );
                                })}

                                {/* Province labels */}
                                {regions.map((region) => {
                                    const isActive = hovered === region.id || selected === region.id;
                                    // Calculate rough center from path for label placement
                                    const centers = {
                                        koshi: [650, 170],
                                        madhesh: [520, 310],
                                        bagmati: [470, 195],
                                        gandaki: [330, 160],
                                        lumbini: [280, 280],
                                        karnali: [185, 135],
                                        sudurpashchim: [100, 185],
                                    };
                                    const [cx, cy] = centers[region.id];
                                    return (
                                        <g key={region.id + '-label'}
                                            style={{ pointerEvents: 'none' }}>
                                            {/* District dot */}
                                            <circle cx={cx} cy={cy - 12} r={isActive ? 5 : 3}
                                                fill={isActive ? region.color : '#444'}
                                                style={{ transition: 'all 0.3s' }} />
                                            {/* Province name */}
                                            <text x={cx} y={cy + 6}
                                                textAnchor="middle"
                                                fill={isActive ? '#fff' : '#666'}
                                                fontSize={isActive ? '11' : '9'}
                                                fontWeight={isActive ? '700' : '500'}
                                                fontFamily="Inter, sans-serif"
                                                style={{ transition: 'all 0.3s' }}>
                                                {region.name.replace(' Province', '')}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Compass indicator */}
                                <g transform="translate(720, 350)">
                                    <text textAnchor="middle" fill="#444" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">N</text>
                                    <line x1="0" y1="5" x2="0" y2="18" stroke="#333" strokeWidth="1" />
                                    <polygon points="0,5 -3,12 3,12" fill="#444" />
                                </g>
                            </svg>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Ice Peaks', color: '#60a5fa' },
                                { label: 'All Terrain', color: '#e8732a' },
                                { label: 'Valley Passes', color: '#34d399' },
                            ].map((l) => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#888' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
                        {activeRegion ? (
                            <div style={{
                                background: '#111', borderRadius: '24px', padding: '32px',
                                border: `1px solid ${activeRegion.color}25`,
                                transition: 'all 0.3s',
                            }}>
                                {/* Region header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: activeRegion.color + '15', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${activeRegion.color}30`,
                                    }}>
                                        <Mountain size={22} color={activeRegion.color} />
                                    </div>
                                    <div>
                                        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '2px' }}>{activeRegion.name}</h2>
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: '700', letterSpacing: '1.5px',
                                            color: activeRegion.color, textTransform: 'uppercase',
                                        }}>{activeRegion.terrain}</span>
                                    </div>
                                </div>

                                <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                    {activeRegion.desc}
                                </p>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Navigation size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Altitude</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{activeRegion.altitude}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Thermometer size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Temp</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{activeRegion.temp}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Wind size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Routes</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{activeRegion.routes.length}</div>
                                    </div>
                                </div>

                                {/* Popular routes */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Popular Routes</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {activeRegion.routes.map((route) => (
                                            <div key={route} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                            }}>
                                                <MapPin size={13} color={activeRegion.color} />
                                                <span style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: '500' }}>{route}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Districts */}
                                <div style={{ marginBottom: '28px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Key Districts</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {activeRegion.districts.map((d) => (
                                            <span key={d} style={{
                                                padding: '5px 12px', borderRadius: '999px', fontSize: '0.7rem',
                                                fontWeight: '600', color: activeRegion.color,
                                                background: activeRegion.color + '10',
                                                border: `1px solid ${activeRegion.color}20`,
                                            }}>{d}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <button onClick={handleProceed} style={{
                                    width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
                                    background: `linear-gradient(135deg, ${activeRegion.color}cc, ${activeRegion.color})`,
                                    color: '#000', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 8px 25px ${activeRegion.color}30`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    Find Vehicles for {activeRegion.name.replace(' Province', '')} <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                background: '#111', borderRadius: '24px', padding: '48px 32px',
                                border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.03)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <MapPin size={28} color="#444" />
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                                    Select a Province
                                </h3>
                                <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Click on any province on the map to see available routes, terrain info, and recommended vehicles.
                                </p>
                            </div>
                        )}

                        {/* Skip button */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button onClick={() => navigate('/vehicles')} style={{
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#888', padding: '10px 24px', borderRadius: '999px',
                                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                            >
                                Skip — Browse All Vehicles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
