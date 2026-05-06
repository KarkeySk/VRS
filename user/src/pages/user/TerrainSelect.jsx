import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, Navigation, Thermometer, Wind } from 'lucide-react';
import nepalProvincePaths from '../../data/nepalProvincePaths.json';

const provinceImages = {
    koshi: [
        'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    ],
    madhesh: [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    ],
    bagmati: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=80',
    ],
    gandaki: [
        'https://images.unsplash.com/photo-1464822759844-d150ad6d4c06?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508261305436-58d85039f88a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=900&q=80',
    ],
    lumbini: [
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    ],
    karnali: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    ],
    sudurpashchim: [
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    ],
};

const regions = [
    {
        id: 'koshi',
        name: 'Koshi Province',
        label: 'Province 1',
        terrain: 'Ice Peaks',
        altitude: '8,848m',
        temp: '-26°C',
        routes: ['Everest Base Camp', 'Kanchenjunga Trek', 'Namche Bazaar'],
        desc: 'Home to Mt. Everest. Very high roads with snow and rough tracks.',
        color: '#60a5fa',
        // Eastern section
        path: 'M748,132 L785,90 L850,115 L885,150 L875,188 L850,220 L825,245 L840,272 L810,305 L752,322 L742,238 L760,205 L742,170 Z',
    },
    {
        id: 'madhesh',
        name: 'Madhesh Province',
        label: 'Province 2',
        terrain: 'Valley Passes',
        altitude: '60m',
        temp: '38°C',
        routes: ['Janakpur Circuit', 'Rajbiraj Wetlands', 'Birgunj–Raxaul Corridor'],
        desc: 'Flat Terai plains with smooth roads and warm weather.',
        color: '#34d399',
        path: 'M372,280 L438,272 L500,266 L562,270 L628,266 L688,260 L742,238 L752,322 L688,316 L628,325 L562,318 L500,326 L435,320 L372,326 Z',
    },
    {
        id: 'bagmati',
        name: 'Bagmati Province',
        label: 'Province 3',
        terrain: 'All Terrain',
        altitude: '1,400m',
        temp: '22°C',
        routes: ['Kathmandu Valley', 'Nagarkot Sunrise', 'Langtang Valley', 'Helambu Trek'],
        desc: 'Nepal\'s capital area with city roads, highways, and some mountain tracks.',
        color: '#e8732a',
        path: 'M548,138 L575,90 L650,85 L715,95 L748,132 L742,170 L760,205 L742,238 L705,254 L645,262 L585,254 L552,205 L540,170 Z',
    },
    {
        id: 'gandaki',
        name: 'Gandaki Province',
        label: 'Province 4',
        terrain: 'Ice Peaks',
        altitude: '8,167m',
        temp: '-18°C',
        routes: ['Annapurna Circuit', 'Upper Mustang', 'Pokhara Lakeside', 'Jomsom Highway'],
        desc: 'Annapurna and Mustang area with famous off-road routes.',
        color: '#818cf8',
        path: 'M388,118 L430,88 L500,80 L545,90 L548,138 L540,170 L552,205 L535,238 L500,252 L438,248 L395,232 L372,230 L360,194 L378,158 Z',
    },
    {
        id: 'lumbini',
        name: 'Lumbini Province',
        label: 'Province 5',
        terrain: 'Valley Passes',
        altitude: '150m',
        temp: '34°C',
        routes: ['Lumbini (Buddha Birthplace)', 'Palpa Hill Station', 'Siddhartha Highway'],
        desc: 'Southern plains with historic places, smooth highways, and easy hill roads.',
        color: '#f59e0b',
        path: 'M170,230 L205,250 L245,270 L300,276 L350,262 L372,280 L372,326 L308,320 L244,330 L182,323 L128,312 L165,268 Z',
    },
    {
        id: 'karnali',
        name: 'Karnali Province',
        label: 'Province 6',
        terrain: 'All Terrain',
        altitude: '4,200m',
        temp: '-8°C',
        routes: ['Rara Lake', 'Dolpo Trek', 'Jumla–Humla Trail', 'Shey Phoksundo'],
        desc: 'A remote and rough area with very few roads. Strong vehicles are best here.',
        color: '#f472b6',
        path: 'M130,110 L185,100 L235,88 L300,95 L360,82 L388,118 L378,158 L360,194 L372,230 L350,262 L300,276 L245,270 L205,250 L170,230 L158,190 L160,150 Z',
    },
    {
        id: 'sudurpashchim',
        name: 'Sudurpashchim Province',
        label: 'Province 7',
        terrain: 'All Terrain',
        altitude: '7,132m',
        temp: '-12°C',
        routes: ['Api Nampa Conservation', 'Khaptad National Park', 'Mahakali Corridor'],
        desc: 'Far-west Nepal with mountain trails and hard border routes.',
        color: '#a78bfa',
        path: 'M20,205 L45,160 L85,130 L130,110 L160,150 L158,190 L170,230 L165,268 L128,312 L88,294 L58,268 L35,238 Z',
    },
];

export default function TerrainSelect() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(null);
    const [wheelType, setWheelType] = useState('all');

    const activeRegion = regions.find((r) => r.id === (selected || hovered));
    const activeImages = activeRegion ? (provinceImages[activeRegion.id] || []) : [];

    const handleSelect = (regionId) => {
        setSelected(regionId);
    };

    const handleProceed = () => {
        if (!activeRegion) return;
        navigate(`/vehicles?terrain=${encodeURIComponent(activeRegion.terrain)}&region=${encodeURIComponent(activeRegion.name)}&wheels=${wheelType}`);
    };

    const provinceCenters = {
        koshi: [808, 203],
        madhesh: [560, 300],
        bagmati: [640, 198],
        gandaki: [470, 190],
        lumbini: [255, 298],
        karnali: [270, 185],
        sudurpashchim: [105, 225],
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,115,42,0.1)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', color: '#e8732a', marginBottom: '16px', border: '1px solid rgba(232,115,42,0.15)' }}>
                        <MapPin size={12} /> PICK YOUR AREA
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
                        Where in Nepal?
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                        Click a province to see routes and find the best vehicle for your road type.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                    {/* Map */}
                    <div style={{ flex: '1 1 55%', minWidth: '350px' }}>
                        <div style={{
                            background: '#0c0c0c', borderRadius: '24px', padding: '24px',
                            border: '1px solid var(--border)', position: 'relative',
                        }}>
                            <svg viewBox="0 0 900 380" style={{ width: '100%', height: 'auto' }}>
                                {/* Nepal outline glow */}
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                    <linearGradient id="nepalMapShade" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                                    </linearGradient>
                                </defs>

                                {/* Nepal silhouette */}
                                <path
                                    d={nepalProvincePaths.outline}
                                    fill="url(#nepalMapShade)"
                                    stroke="rgba(255,255,255,0.22)"
                                    strokeWidth="1.3"
                                />

                                {/* Province shapes */}
                                {regions.map((region) => {
                                    const isHovered = hovered === region.id;
                                    const isSelected = selected === region.id;
                                    const isActive = isHovered || isSelected;
                                    return (
                                        <g key={region.id}>
                                            <path
                                                d={nepalProvincePaths.paths[region.id] || region.path}
                                                fill={isActive ? region.color + '28' : 'rgba(255,255,255,0.025)'}
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
                                    const [cx, cy] = provinceCenters[region.id];
                                    return (
                                        <g key={region.id + '-label'}
                                            style={{ pointerEvents: 'none' }}>
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
                                <g transform="translate(860, 346)">
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
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
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
                                background: 'var(--bg-card)', borderRadius: '24px', padding: '32px',
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
                                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '2px' }}>{activeRegion.name}</h2>
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: '700', letterSpacing: '1.5px',
                                            color: activeRegion.color, textTransform: 'uppercase',
                                        }}>{activeRegion.terrain}</span>
                                    </div>
                                </div>

                                <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                    {activeRegion.desc}
                                </p>

                                {activeImages.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <img
                                            src={activeImages[0]}
                                            alt={`${activeRegion.name} location`}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '180px',
                                                objectFit: 'cover',
                                                borderRadius: '14px',
                                                border: '1px solid var(--border)',
                                                marginBottom: '8px',
                                            }}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {activeImages.slice(1, 3).map((imageUrl, idx) => (
                                                <img
                                                    key={imageUrl}
                                                    src={imageUrl}
                                                    alt={`${activeRegion.name} view ${idx + 2}`}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: '86px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: 'var(--bg-glass)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Navigation size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Height</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{activeRegion.altitude}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-glass)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Thermometer size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Temp</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{activeRegion.temp}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-glass)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                                        <Wind size={14} color="#888" style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Routes</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>{activeRegion.routes.length}</div>
                                    </div>
                                </div>

                                {/* Popular routes */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Top Routes</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {activeRegion.routes.map((route) => (
                                            <div key={route} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '12px',
                                                background: 'var(--bg-glass)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                            }}>
                                                <MapPin size={13} color={activeRegion.color} />
                                                <span style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: '500' }}>{route}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Vehicle Kind</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'all', label: 'All' },
                                            { id: 'four', label: 'Four Wheeler' },
                                            { id: 'two', label: 'Two Wheeler' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setWheelType(item.id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '999px',
                                                    border: wheelType === item.id ? `1px solid ${activeRegion.color}` : '1px solid rgba(255,255,255,0.12)',
                                                    background: wheelType === item.id ? `${activeRegion.color}20` : 'transparent',
                                                    color: wheelType === item.id ? activeRegion.color : '#ccc',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <button onClick={handleProceed} style={{
                                    width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
                                    background: `linear-gradient(135deg, ${activeRegion.color}cc, ${activeRegion.color})`,
                                    color: 'var(--accent-ink)', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 8px 25px ${activeRegion.color}30`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    See Vehicles in {activeRegion.name.replace(' Province', '')} <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '24px', padding: '48px 32px',
                                border: '1px solid var(--border)', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'var(--bg-glass)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                    border: '1px solid var(--border)',
                                }}>
                                    <MapPin size={28} color="#444" />
                                </div>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
                                    Pick a Province
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Click any province on the map to see routes, road info, and suggested vehicles.
                                </p>
                            </div>
                        )}

                        {/* Skip button */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button onClick={() => navigate('/vehicles')} style={{
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '999px',
                                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                            >
                                Skip - See All Vehicles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
