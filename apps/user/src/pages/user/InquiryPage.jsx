import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js';
import { inquiryService } from '@bhatbhati/shared/services/inquiryService.js';
import { Star, Send, ArrowLeft } from 'lucide-react';
import { normalizeVehicle } from '../../utils/vehicleMapper';

export default function InquiryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);

    const [driveType, setDriveType] = useState('self-drive');
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVehicleLoading, setIsVehicleLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true
        const loadVehicle = async () => {
            setIsVehicleLoading(true)
            try {
                const data = await vehicleService.getById(id)
                if (mounted) setVehicle(normalizeVehicle(data))
            } catch {
                if (mounted) setVehicle(null)
            } finally {
                if (mounted) setIsVehicleLoading(false)
            }
        }
        loadVehicle()
        return () => { mounted = false }
    }, [id])

    if (isVehicleLoading) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Loading vehicle...</h2>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Vehicle not found</h2>
                <button onClick={() => navigate('/vehicles')} style={{ marginTop: '20px', background: '#e8732a', color: 'var(--accent-ink)', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Back to Fleet</button>
            </div>
        );
    }

    const toggleAddon = (addonId) => {
        setSelectedAddons((prev) => prev.includes(addonId) ? prev.filter((x) => x !== addonId) : [...prev, addonId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const inquiry = await inquiryService.create({
                user_id: user.id,
                vehicle_id: vehicle.id,
                drive_type: driveType,
                selected_addons: selectedAddons.map((aid) => vehicle.addons.find((a) => a.id === aid)),
                message,
            });
            navigate(`/apply/${inquiry.id}`);
        } catch (err) {
            setError(err.message || 'Failed to submit inquiry');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '14px 16px', background: 'var(--bg-glass)',
        border: '1px solid var(--border)', borderRadius: '14px',
        color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', resize: 'vertical',
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '32px' }}>
                    <ArrowLeft size={16} /> Back to vehicle
                </button>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px', background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border)' }}>
                    <img src={vehicle.image} alt={vehicle.name} style={{ width: '120px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>{vehicle.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{vehicle.subtitle}</p>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                            {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= vehicle.rating ? '#e8732a' : 'none'} color={s <= vehicle.rating ? '#e8732a' : '#444'} />)}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#e8732a' }}>${vehicle.price}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>per day</div>
                    </div>
                </div>

                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Send Request</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '32px' }}>Tell us your plan. We will review and reply.</p>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '20px', color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Drive Type</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['self-drive', 'with-driver'].map((dt) => (
                                <button key={dt} type="button" onClick={() => setDriveType(dt)} style={{
                                    flex: 1, padding: '14px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                    background: driveType === dt ? 'rgba(232,115,42,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${driveType === dt ? '#e8732a' : 'rgba(255,255,255,0.08)'}`,
                                    color: driveType === dt ? '#e8732a' : '#888', transition: 'all 0.2s',
                                }}>
                                    {dt === 'self-drive' ? 'Self Drive' : 'With Driver'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Extras</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {vehicle.addons.map((addon) => {
                                const sel = selectedAddons.includes(addon.id);
                                return (
                                    <div key={addon.id} onClick={() => toggleAddon(addon.id)} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                        background: sel ? 'rgba(232,115,42,0.05)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${sel ? '#e8732a' : 'rgba(255,255,255,0.08)'}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '5px',
                                                border: `1px solid ${sel ? '#e8732a' : '#444'}`,
                                                background: sel ? '#e8732a' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
                                            </div>
                                            <span style={{ color: sel ? '#fff' : '#aaa', fontSize: '0.85rem' }}>{addon.name}</span>
                                        </div>
                                        <span style={{ color: '#e8732a', fontSize: '0.85rem', fontWeight: '600' }}>+${addon.price}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Message (Optional)</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your trip dates and group size..." rows={4} style={inputStyle} />
                    </div>

                    <button type="submit" disabled={isLoading} style={{
                        width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
                        background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                        fontSize: '0.9rem', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                        {isLoading ? 'Sending...' : <><Send size={16} /> Send Request</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
