import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { Car, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

const statusConfig = {
    submitted:      { label: 'Submitted', color: '#3b82f6', Icon: Clock },
    'under-review': { label: 'Under Review', color: '#f59e0b', Icon: AlertCircle },
    approved:       { label: 'Approved', color: '#34d399', Icon: CheckCircle },
    rejected:       { label: 'Rejected', color: '#ef4444', Icon: XCircle },
    confirmed:      { label: 'Confirmed', color: '#34d399', Icon: CheckCircle },
    cancelled:      { label: 'Cancelled', color: '#888', Icon: XCircle },
};

export default function BookingsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        applicationService.getMyApplications(user.id)
            .then(setApplications)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    const handleCancel = async (id) => {
        try {
            await applicationService.cancel(id);
            setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
        } catch {}
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>My Bookings</h1>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '36px' }}>Track all your booking applications and their status.</p>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>Loading...</div>
                ) : applications.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px', background: '#111',
                        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <Car size={48} color="#333" style={{ marginBottom: '16px' }} />
                        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>No bookings yet</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>Start by browsing our fleet and submitting an inquiry.</p>
                        <Link to="/terrain" style={{
                            textDecoration: 'none', background: 'linear-gradient(135deg, #fcab73, #e8732a)',
                            color: '#000', fontWeight: '700', fontSize: '0.85rem', padding: '14px 28px',
                            borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        }}>
                            Choose Terrain <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {applications.map((app) => {
                            const status = statusConfig[app.status] || statusConfig.submitted;
                            const StatusIcon = status.Icon;
                            return (
                                <div key={app.id} style={{
                                    background: '#111', borderRadius: '20px', padding: '24px',
                                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                                        {app.vehicles?.image && (
                                            <img src={app.vehicles.image} alt="" style={{ width: '80px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{app.vehicles?.name || 'Vehicle'}</h3>
                                            <div style={{ color: '#888', fontSize: '0.75rem' }}>
                                                {app.start_date} → {app.end_date} · {app.drive_type === 'with-driver' ? 'With Driver' : 'Self Drive'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#e8732a', fontSize: '1.2rem', fontWeight: '800' }}>${app.total_price}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <StatusIcon size={14} color={status.color} />
                                                <span style={{ color: status.color, fontSize: '0.75rem', fontWeight: '600' }}>{status.label}</span>
                                            </div>
                                        </div>

                                        {(app.status === 'submitted' || app.status === 'under-review') && (
                                            <button onClick={() => handleCancel(app.id)} style={{
                                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                color: '#ef4444', padding: '8px 16px', borderRadius: '10px',
                                                fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                            }}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
