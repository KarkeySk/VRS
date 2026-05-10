import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { buildEsewaPayload, generateTransactionUuid, getEsewaConfig } from '@bhatbhati/shared/utils/esewaConfig.js';
import { ArrowLeft, Shield, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await applicationService.getById(applicationId);
                if (!mounted) return;

                // Only allow payment for approved applications with pending payment
                if (data.status !== 'approved' || data.payment_status === 'completed') {
                    setError(
                        data.payment_status === 'completed'
                            ? 'This booking has already been paid for.'
                            : 'This booking is not ready for payment yet.'
                    );
                }
                setApp(data);
            } catch {
                if (mounted) setError('Booking not found');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [applicationId]);

    const handleEsewaPayment = () => {
        if (!app || processing) return;
        setProcessing(true);

        try {
            const transactionUuid = generateTransactionUuid();
            const config = getEsewaConfig();

            // eSewa appends `?data=<base64>` to whichever URL we give it.
            // Our URLs MUST NOT already contain a query string, otherwise the
            // result becomes `…?foo=bar?data=…` (illegal — second `?` is treated
            // as part of the previous value and `data` is never parsed).
            // Encode applicationId in the path instead.
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/payment/success/${applicationId}`;
            const failureUrl = `${baseUrl}/payment/${applicationId}`;

            const payload = buildEsewaPayload({
                amount: Number(app.total_price),
                transactionUuid,
                successUrl,
                failureUrl,
            });

            // Create hidden form and submit to eSewa
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = config.paymentUrl;

            Object.entries(payload).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            setError(err.message || 'Failed to initiate payment');
            setProcessing(false);
        }
    };

    // Check for failed payment redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('failed') === 'true') {
            setError('Payment was cancelled or failed. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                Loading payment details...
            </div>
        );
    }

    if (error && !app) {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#ef4444', fontSize: '1rem' }}>{error}</p>
                <Link to="/bookings" style={{
                    display: 'inline-block', marginTop: '20px', color: 'var(--text-secondary)',
                    textDecoration: 'none', fontSize: '0.85rem',
                }}>← Back to Bookings</Link>
            </div>
        );
    }

    const canPay = app?.status === 'approved' && app?.payment_status !== 'completed';

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px' }}>
                <button onClick={() => navigate(-1)} style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                    cursor: 'pointer', marginBottom: '24px',
                }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
                    Complete Payment
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '32px' }}>
                    Your booking has been approved! Pay to confirm your reservation.
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                        color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Booking Summary Card */}
                {app && (
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: '20px', padding: '28px',
                        border: '1px solid var(--border)', marginBottom: '24px',
                    }}>
                        <div style={{
                            fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase',
                            letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '16px',
                        }}>Booking Summary</div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                            {app.vehicles?.image && (
                                <img src={app.vehicles.image} alt="" style={{
                                    width: '72px', height: '52px', borderRadius: '12px', objectFit: 'cover',
                                }} />
                            )}
                            <div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                                    {app.vehicles?.name || 'Vehicle'}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                                    {app.drive_type === 'with-driver' ? 'With Driver' : 'Self Drive'}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                            padding: '16px 0', borderTop: '1px solid var(--border)',
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>{app.start_date}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>{app.end_date}</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '20px 0 0', borderTop: '1px solid var(--border)', marginTop: '4px',
                        }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Total Amount</span>
                            <span style={{ color: '#e8732a', fontSize: '1.6rem', fontWeight: '800' }}>
                                NPR {Number(app.total_price).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                {canPay && (
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: '20px', padding: '28px',
                        border: '1px solid var(--border)', marginBottom: '24px',
                    }}>
                        <div style={{
                            fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase',
                            letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '20px',
                        }}>Payment Method</div>

                        {/* eSewa Button */}
                        <button
                            onClick={handleEsewaPayment}
                            disabled={processing}
                            style={{
                                width: '100%',
                                padding: '18px 24px',
                                border: '2px solid #60bb46',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(96,187,70,0.08), rgba(96,187,70,0.02))',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                opacity: processing ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                if (!processing) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(96,187,70,0.15), rgba(96,187,70,0.05))';
                                    e.currentTarget.style.borderColor = '#4da836';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(96,187,70,0.2)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(96,187,70,0.08), rgba(96,187,70,0.02))';
                                e.currentTarget.style.borderColor = '#60bb46';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: '#60bb46', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>eS</span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem' }}>
                                        {processing ? 'Redirecting to eSewa...' : 'Pay with eSewa'}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>
                                        Nepal&apos;s #1 digital wallet
                                    </div>
                                </div>
                            </div>
                            <CreditCard size={20} color="#60bb46" />
                        </button>
                    </div>
                )}

                {/* Already paid message */}
                {app?.payment_status === 'completed' && (
                    <div style={{
                        background: 'rgba(52,211,153,0.05)', borderRadius: '20px', padding: '28px',
                        border: '1px solid rgba(52,211,153,0.2)', marginBottom: '24px', textAlign: 'center',
                    }}>
                        <CheckCircle size={40} color="#34d399" style={{ margin: '0 auto 12px' }} />
                        <div style={{ color: '#34d399', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>
                            Payment Completed
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            Your booking is confirmed!
                        </div>
                        <Link to={`/booking/confirm/${applicationId}`} style={{
                            display: 'inline-block', marginTop: '16px',
                            background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                            fontWeight: '700', fontSize: '0.8rem', padding: '12px 24px',
                            borderRadius: '12px', textDecoration: 'none',
                        }}>View Booking</Link>
                    </div>
                )}

                {/* Security info */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                }}>
                    <Shield size={16} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        Payments are securely processed through eSewa. Your financial details are never stored on our servers.
                    </span>
                </div>
            </div>
        </div>
    );
}
