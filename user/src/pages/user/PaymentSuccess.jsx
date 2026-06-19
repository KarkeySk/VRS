import { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { paymentService } from '@bhatbhati/shared/services/paymentService.js';
import { notificationService } from '@bhatbhati/shared/services/notificationService.js';
import { emailService } from '@bhatbhati/shared/services/emailService.js';
import { decodeEsewaResponse } from '@bhatbhati/shared/utils/esewaConfig.js';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const { applicationId: appId } = useParams();
    const { user } = useAuth();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [app, setApp] = useState(null);

    useEffect(() => {
        const verify = async () => {
            const data = searchParams.get('data');

            if (!appId) {
                setStatus('error');
                setMessage('This page is for the payment gateway redirect. Open a booking from your bookings list to pay.');
                return;
            }
            if (!data) {
                setStatus('error');
                setMessage('Payment callback is missing the eSewa response data. Try paying again.');
                return;
            }
            try {
                const decoded = decodeEsewaResponse(data);
                if (!decoded || decoded.status !== 'COMPLETE') {
                    setStatus('error');
                    setMessage('Payment was not completed.');
                    if (appId) await paymentService.markFailed(appId).catch(() => {});
                    return;
                }
                const appData = await applicationService.getById(appId);
                if (!appData) { setStatus('error'); setMessage('Booking not found.'); return; }

                const paidAmount = Number(decoded.total_amount);
                const expectedAmount = Number(appData.total_price);
                if (Math.abs(paidAmount - expectedAmount) > 1) {
                    setStatus('error');
                    setMessage(`Amount mismatch. Expected NPR ${expectedAmount}, got NPR ${paidAmount}.`);
                    await paymentService.markFailed(appId).catch(() => {});
                    return;
                }
                await paymentService.markPaid(appId, decoded.transaction_uuid, decoded.ref_id || null);
                if (user?.id) {
                    await notificationService.create({
                        userId: user.id, type: 'payment_success',
                        title: 'Payment Successful!',
                        message: `Payment of NPR ${expectedAmount.toLocaleString()} confirmed.`,
                        applicationId: appId,
                    }).catch(() => {});
                }
                // Email the customer that their booking is now activated.
                // markPaid is atomic (throws if already paid), so this runs only once.
                await emailService.sendBookingConfirmationEmail({
                    userEmail: appData.profiles?.email || user?.email,
                    bookingId: appId,
                    startDate: appData.start_date,
                    endDate: appData.end_date,
                    subject: 'Booking activated',
                    message: `Payment received — your booking for ${appData.vehicles?.name || 'your vehicle'} is now confirmed and activated.`,
                }).catch(() => {});
                setApp(appData);
                setStatus('success');
                setMessage('Payment verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. Contact support.');
            }
        };
        verify();
    }, [searchParams, user?.id, appId]);

    const iconWrap = (bg, border) => ({
        width: '80px', height: '80px', borderRadius: '50%',
        background: bg, border: `2px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
    });
    const btnPrimary = {
        textDecoration: 'none', padding: '14px 28px', borderRadius: '14px',
        background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
        fontWeight: '700', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px',
    };
    const btnSecondary = {
        textDecoration: 'none', padding: '14px 28px', borderRadius: '14px',
        background: 'var(--bg-glass)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem',
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '480px', padding: '0 20px' }}>
                {status === 'verifying' && (<>
                    <div style={iconWrap('rgba(96,187,70,0.08)', 'rgba(96,187,70,0.2)')}>
                        <Loader size={36} color="#60bb46" className="spin-icon" />
                    </div>
                    <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>Verifying Payment</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
                </>)}
                {status === 'success' && (<>
                    <div style={iconWrap('rgba(52,211,153,0.1)', 'rgba(52,211,153,0.3)')}>
                        <CheckCircle size={44} color="#34d399" />
                    </div>
                    <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>Payment Successful!</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>Your booking has been confirmed and activated.</p>

                    {app && (
                        <div style={{
                            background: 'var(--bg-card)', borderRadius: '18px', padding: '20px',
                            border: '1px solid var(--border)', marginBottom: '28px', textAlign: 'left',
                        }}>
                            <div style={{
                                fontSize: '0.58rem', fontWeight: '700', textTransform: 'uppercase',
                                letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '14px',
                            }}>Vehicle Booked</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                {app.vehicles?.image && (
                                    <img src={app.vehicles.image} alt="" style={{
                                        width: '72px', height: '52px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0,
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
                                padding: '14px 0', borderTop: '1px solid var(--border)',
                            }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>{app.start_date}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>{app.end_date}</div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 0 0', borderTop: '1px solid var(--border)',
                            }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>Amount Paid</span>
                                <span style={{ color: 'var(--accent)', fontSize: '1.3rem', fontWeight: '800' }}>
                                    NPR {Number(app.total_price).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {appId && <Link to={`/booking/confirm/${appId}`} style={btnPrimary}>View Booking <ArrowRight size={16} /></Link>}
                        <Link to="/bookings" style={btnSecondary}>All Bookings</Link>
                    </div>
                </>)}
                {status === 'error' && (<>
                    <div style={iconWrap('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.2)')}>
                        <XCircle size={44} color="#ef4444" />
                    </div>
                    <h1 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Payment Failed</h1>
                    <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px' }}>{message}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '36px' }}>No money was deducted. Try again or contact support.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {appId && <Link to={`/payment/${appId}`} style={btnPrimary}>Try Again</Link>}
                        <Link to="/bookings" style={btnSecondary}>Back to Bookings</Link>
                    </div>
                </>)}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.spin-icon{animation:spin 1.5s linear infinite}`}</style>
        </div>
    );
}
