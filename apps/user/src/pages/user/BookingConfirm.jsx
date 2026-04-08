import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { CheckCircle, ArrowRight, Clock, Car } from 'lucide-react';

export default function BookingConfirm() {
    const { applicationId } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        applicationService.getById(applicationId)
            .then(setApp)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [applicationId]);

    if (loading) return <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Loading...</div>;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '500px', padding: '0 20px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                }}>
                    <CheckCircle size={40} color="#34d399" />
                </div>

                <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>Request Sent!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
                    Your booking request was sent. Our team will check your documents and reply soon.
                </p>

                {app && (
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: '20px', padding: '24px',
                        border: '1px solid var(--border)', marginBottom: '32px', textAlign: 'left',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Car size={18} color="#e8732a" />
                            <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{app.vehicles?.name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>{app.start_date}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>{app.end_date}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total</div>
                                <div style={{ color: '#e8732a', fontSize: '1.1rem', fontWeight: '800' }}>${app.total_price}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Status</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} color="#f59e0b" />
                                    <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>Checking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link to="/bookings" style={{
                        textDecoration: 'none', padding: '14px 24px', borderRadius: '14px',
                        background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                        fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        View My Bookings <ArrowRight size={16} />
                    </Link>
                    <Link to="/dashboard" style={{
                        textDecoration: 'none', padding: '14px 24px', borderRadius: '14px',
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem',
                    }}>
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
