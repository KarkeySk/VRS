import { useNavigate } from 'react-router-dom';
import { Mountain, TreePine, Route, Compass } from 'lucide-react';

const terrains = [
    {
        id: 'Ice Peaks',
        label: 'Ice Peaks',
        desc: 'High-altitude frozen passes above 4,500m. Extreme cold, snow, and ice.',
        icon: Mountain,
        color: '#60a5fa',
        image: '/images/fleet-motorcycle.png',
    },
    {
        id: 'All Terrain',
        label: 'All Terrain',
        desc: 'Mixed conditions — gravel, mud, river crossings, and steep inclines.',
        icon: Compass,
        color: '#e8732a',
        image: '/images/fleet-jeep.png',
    },
    {
        id: 'Valley Passes',
        label: 'Valley Passes',
        desc: 'Winding valley roads, moderate altitude, scenic but narrow routes.',
        icon: TreePine,
        color: '#34d399',
        image: '/images/fleet-suv.png',
    },
];

export default function TerrainSelect() {
    const navigate = useNavigate();

    const handleSelect = (terrainId) => {
        navigate(`/vehicles?terrain=${encodeURIComponent(terrainId)}`);
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,115,42,0.1)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', color: '#e8732a', marginBottom: '16px', border: '1px solid rgba(232,115,42,0.15)' }}>
                        <Route size={12} /> STEP 1 OF 3
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
                        Choose Your Terrain
                    </h1>
                    <p style={{ color: '#888', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                        Select the type of terrain you'll be conquering. We'll recommend the best vehicles for your expedition.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                    {terrains.map((t) => {
                        const Icon = t.icon;
                        return (
                            <div key={t.id} onClick={() => handleSelect(t.id)} style={{
                                position: 'relative', overflow: 'hidden', borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                                transition: 'transform 0.3s, border-color 0.3s', height: '360px',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = t.color + '50'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                            >
                                <img src={t.image} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />

                                <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px', zIndex: 2 }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '16px',
                                        background: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '16px', border: `1px solid ${t.color}30`,
                                    }}>
                                        <Icon size={24} color={t.color} />
                                    </div>
                                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>{t.label}</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button onClick={() => navigate('/vehicles')} style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#888', padding: '12px 28px', borderRadius: '999px',
                        fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                    >
                        Skip — Browse All Vehicles
                    </button>
                </div>
            </div>
        </div>
    );
}
