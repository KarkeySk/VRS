import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { DRIVER_FEE_PER_DAY } from '@bhatbhati/shared/utils/constants.js';
import { Car, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, CreditCard, ChevronDown, FileText, Pencil } from 'lucide-react';

const statusConfig = {
    submitted:      { label: 'Submitted', color: 'var(--status-info)', Icon: Clock },
    'under-review': { label: 'Under Review', color: 'var(--status-warning)', Icon: AlertCircle },
    approved:       { label: 'Approved', color: 'var(--status-success)', Icon: CheckCircle },
    rejected:       { label: 'Rejected', color: 'var(--status-error)', Icon: XCircle },
    confirmed:      { label: 'Confirmed', color: 'var(--status-success)', Icon: CheckCircle },
    cancelled:      { label: 'Cancelled', color: 'var(--text-secondary)', Icon: XCircle },
};

const paymentLabels = {
    pending:   'Pending',
    completed: 'Completed',
    failed:    'Failed',
};

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

const humanize = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// A booking may only be edited while it is still awaiting approval and unpaid.
const isEditable = (app) =>
    ['submitted', 'under-review'].includes(app.status) && app.payment_status !== 'completed';

// One label/value line inside the expanded details panel.
function DetailRow({ label, children }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: '600', textAlign: 'right', wordBreak: 'break-word' }}>{children ?? '—'}</span>
        </div>
    );
}

function EditField({ label, value, onChange, type = 'text' }) {
    return (
        <label style={{ display: 'block' }}>
            <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-glass)',
                    border: '1px solid var(--border)', borderRadius: '10px',
                    color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                }}
            />
        </label>
    );
}

function SectionTitle({ children }) {
    return (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '16px 0 4px' }}>
            {children}
        </div>
    );
}

export default function BookingsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [docUrls, setDocUrls] = useState({}); // { [appId]: { license, id } }
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');

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
        } catch {
            // cancel errors are silent — UI already shows the current state
        }
    };

    const toggleExpand = async (app) => {
        const next = expandedId === app.id ? null : app.id;
        setExpandedId(next);
        // Lazily resolve signed URLs for the private document bucket on first open.
        if (next && !docUrls[app.id] && (app.license_doc_url || app.id_doc_url)) {
            try {
                const [license, idDoc] = await Promise.all([
                    applicationService.getDocumentUrl(app.license_doc_url),
                    applicationService.getDocumentUrl(app.id_doc_url),
                ]);
                setDocUrls((prev) => ({ ...prev, [app.id]: { license, id: idDoc } }));
            } catch {
                // ignore — links simply won't render
            }
        }
    };

    const startEdit = (app) => {
        const q = app.questionnaire || {};
        const c = q.customer || {};
        setEditError('');
        setExpandedId(app.id); // keep the panel open while editing
        setEditingId(app.id);
        setForm({
            start_date: app.start_date || '',
            end_date: app.end_date || '',
            license_number: app.license_number || '',
            name: c.name || '',
            phone: c.phone || '',
            email: c.email || '',
            experience: q.experience ?? '',
            group_size: q.group_size ?? '',
            purpose: q.purpose || '',
            medical_conditions: q.medical_conditions || '',
            emergency_contact: q.emergency_contact || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(null);
        setEditError('');
    };

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const saveEdit = async (app) => {
        setEditError('');
        if (!form.name.trim()) { setEditError('Please enter your full name.'); return; }
        if (!form.email.trim()) { setEditError('Please enter your email.'); return; }
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        if (!form.start_date || !form.end_date || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setEditError('Please choose valid start and end dates.'); return;
        }
        if (end < start) { setEditError('End date cannot be earlier than start date.'); return; }

        // Recompute price the same way the original application did.
        const days = Math.max(1, Math.ceil((end - start) / 86400000));
        const basePrice = app.vehicles?.price_per_day || 0;
        const addonsTotal = (app.selected_addons || []).reduce((s, a) => s + (a.price || 0), 0);
        const driverFee = app.drive_type === 'with-driver' ? DRIVER_FEE_PER_DAY * days : 0;
        const totalPrice = (basePrice * days) + addonsTotal + driverFee;

        const questionnaire = {
            ...(app.questionnaire || {}),
            experience: form.experience,
            group_size: form.group_size,
            purpose: form.purpose,
            medical_conditions: form.medical_conditions,
            emergency_contact: form.emergency_contact,
            customer: {
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim().toLowerCase(),
            },
        };

        setSaving(true);
        try {
            const updated = await applicationService.update(app.id, {
                start_date: form.start_date,
                end_date: form.end_date,
                license_number: form.license_number.trim() || null,
                total_price: totalPrice,
                questionnaire,
            });
            setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, ...updated } : a));
            cancelEdit();
        } catch (err) {
            setEditError(err.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>My Bookings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Track your booking requests and status.</p>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>Loading...</div>
                ) : applications.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)',
                        borderRadius: '24px', border: '1px solid var(--border)',
                    }}>
                        <Car size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.7 }} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>No bookings yet</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Start by choosing a vehicle and sending a request.</p>
                        <Link to="/terrain" style={{
                            textDecoration: 'none', background: 'var(--brand-gradient)',
                            color: 'var(--accent-ink)', fontWeight: '700', fontSize: '0.85rem', padding: '14px 28px',
                            borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        }}>
                            Pick Road Type <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {applications.map((app) => {
                            const status = statusConfig[app.status] || statusConfig.submitted;
                            const StatusIcon = status.Icon;
                            const isExpanded = expandedId === app.id;
                            return (
                                <div key={app.id} style={{
                                    background: 'var(--bg-card)', borderRadius: '20px', padding: '24px',
                                    border: '1px solid var(--border)',
                                }}>
                                  <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    flexWrap: 'wrap', gap: '16px',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                                        {app.vehicles?.image && (
                                            <img src={app.vehicles.image} alt="" style={{ width: '80px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{app.vehicles?.name || 'Vehicle'}</h3>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                {app.start_date} → {app.end_date} · {app.drive_type === 'with-driver' ? 'With Driver' : 'Self Drive'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '800' }}>NPR {Number(app.total_price).toLocaleString()}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <StatusIcon size={14} color={status.color} />
                                                <span style={{ color: status.color, fontSize: '0.75rem', fontWeight: '600' }}>{status.label}</span>
                                            </div>
                                        </div>

                                        {isEditable(app) && (
                                            <button onClick={() => (editingId === app.id ? cancelEdit() : startEdit(app))} style={{
                                                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '10px',
                                                fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
                                            }}>
                                                <Pencil size={13} /> {editingId === app.id ? 'Close editor' : 'Edit'}
                                            </button>
                                        )}

                                        {(app.status === 'submitted' || app.status === 'under-review') && (
                                            <button onClick={() => handleCancel(app.id)} style={{
                                                background: 'var(--status-error-soft)', border: '1px solid var(--status-error-border)',
                                                color: 'var(--status-error)', padding: '8px 16px', borderRadius: '10px',
                                                fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                            }}>
                                                Cancel
                                            </button>
                                        )}

                                        {/* Pay Now button for approved bookings */}
                                        {app.status === 'approved' && app.payment_status !== 'completed' && (
                                            <Link to={`/payment/${app.id}`} style={{
                                                textDecoration: 'none',
                                                background: 'var(--status-pay)',
                                                color: '#ffffff', padding: '8px 20px', borderRadius: '10px',
                                                fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                boxShadow: '0 4px 12px var(--status-pay-soft)',
                                            }}>
                                                <CreditCard size={14} /> Pay Now
                                            </Link>
                                        )}

                                        {/* Payment completed badge */}
                                        {app.payment_status === 'completed' && (
                                            <span style={{
                                                background: 'var(--status-success-soft)', border: '1px solid var(--status-success-border)',
                                                color: 'var(--status-success)', padding: '6px 12px', borderRadius: '8px',
                                                fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}>
                                                ✓ Paid
                                            </span>
                                        )}
                                    </div>
                                  </div>

                                  {/* Expand / collapse full details */}
                                  <button
                                    onClick={() => toggleExpand(app)}
                                    style={{
                                        marginTop: '16px', width: '100%', background: 'transparent',
                                        border: '1px solid var(--border)', borderRadius: '12px',
                                        color: 'var(--text-secondary)', padding: '10px', cursor: 'pointer',
                                        fontSize: '0.75rem', fontWeight: '600', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit',
                                    }}
                                  >
                                    {isExpanded ? 'Hide details' : 'View full details'}
                                    <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                  </button>

                                  {isExpanded && editingId === app.id && form && (
                                    <div style={{ marginTop: '16px' }}>
                                        <SectionTitle>Edit booking</SectionTitle>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                            <EditField label="Start date" type="date" value={form.start_date} onChange={(v) => setField('start_date', v)} />
                                            <EditField label="End date" type="date" value={form.end_date} onChange={(v) => setField('end_date', v)} />
                                            <EditField label="License number" value={form.license_number} onChange={(v) => setField('license_number', v)} />
                                            <EditField label="Full name" value={form.name} onChange={(v) => setField('name', v)} />
                                            <EditField label="Phone" value={form.phone} onChange={(v) => setField('phone', v)} />
                                            <EditField label="Email" type="email" value={form.email} onChange={(v) => setField('email', v)} />
                                            <EditField label="Driving experience" value={form.experience} onChange={(v) => setField('experience', v)} />
                                            <EditField label="Group size" type="number" value={form.group_size} onChange={(v) => setField('group_size', v)} />
                                            <EditField label="Emergency contact" value={form.emergency_contact} onChange={(v) => setField('emergency_contact', v)} />
                                            <EditField label="Purpose" value={form.purpose} onChange={(v) => setField('purpose', v)} />
                                            <EditField label="Medical conditions" value={form.medical_conditions} onChange={(v) => setField('medical_conditions', v)} />
                                        </div>

                                        {editError && (
                                            <div style={{ color: 'var(--status-error)', fontSize: '0.75rem', marginTop: '12px' }}>{editError}</div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                            <button onClick={() => saveEdit(app)} disabled={saving} style={{
                                                background: 'var(--brand-gradient)', color: 'var(--accent-ink)', border: 'none',
                                                padding: '10px 24px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700',
                                                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
                                            }}>
                                                {saving ? 'Saving…' : 'Save changes'}
                                            </button>
                                            <button onClick={cancelEdit} disabled={saving} style={{
                                                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                                                padding: '10px 24px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600',
                                                cursor: 'pointer', fontFamily: 'inherit',
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '10px' }}>
                                            The total price updates automatically when you change the dates.
                                        </p>
                                    </div>
                                  )}

                                  {isExpanded && editingId !== app.id && (() => {
                                    const q = app.questionnaire || {};
                                    const customer = q.customer || {};
                                    const addons = app.selected_addons || [];
                                    const docs = docUrls[app.id] || {};
                                    return (
                                      <div style={{ marginTop: '16px' }}>
                                        <SectionTitle>Booking</SectionTitle>
                                        <DetailRow label="Booking ID">{app.id}</DetailRow>
                                        <DetailRow label="Vehicle">{app.vehicles?.name || '—'}</DetailRow>
                                        <DetailRow label="Start date">{app.start_date}</DetailRow>
                                        <DetailRow label="End date">{app.end_date}</DetailRow>
                                        <DetailRow label="Drive type">{app.drive_type === 'with-driver' ? 'With Driver' : 'Self Drive'}</DetailRow>
                                        <DetailRow label="Status">{status.label}</DetailRow>

                                        <SectionTitle>Contact</SectionTitle>
                                        <DetailRow label="Name">{customer.name}</DetailRow>
                                        <DetailRow label="Phone">{customer.phone}</DetailRow>
                                        <DetailRow label="Email">{customer.email}</DetailRow>
                                        {q.emergency_contact && <DetailRow label="Emergency contact">{q.emergency_contact}</DetailRow>}

                                        <SectionTitle>Trip details</SectionTitle>
                                        {q.experience !== undefined && <DetailRow label="Driving experience">{String(q.experience)}</DetailRow>}
                                        {q.group_size !== undefined && <DetailRow label="Group size">{String(q.group_size)}</DetailRow>}
                                        {q.purpose && <DetailRow label="Purpose">{q.purpose}</DetailRow>}
                                        {q.medical_conditions && <DetailRow label="Medical conditions">{q.medical_conditions}</DetailRow>}

                                        <SectionTitle>Driver & documents</SectionTitle>
                                        <DetailRow label="License number">{app.license_number}</DetailRow>
                                        <DetailRow label="License document">
                                            {app.license_doc_url
                                                ? (docs.license
                                                    ? <a href={docs.license} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> View</a>
                                                    : 'Loading…')
                                                : 'Not uploaded'}
                                        </DetailRow>
                                        <DetailRow label="ID document">
                                            {app.id_doc_url
                                                ? (docs.id
                                                    ? <a href={docs.id} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> View</a>
                                                    : 'Loading…')
                                                : 'Not uploaded'}
                                        </DetailRow>

                                        {addons.length > 0 && (
                                            <>
                                                <SectionTitle>Add-ons</SectionTitle>
                                                {addons.map((a, i) => (
                                                    <DetailRow key={i} label={a.name || a.label || `Add-on ${i + 1}`}>
                                                        {a.price != null ? `NPR ${Number(a.price).toLocaleString()}` : '—'}
                                                    </DetailRow>
                                                ))}
                                            </>
                                        )}

                                        <SectionTitle>Payment</SectionTitle>
                                        <DetailRow label="Total price">NPR {Number(app.total_price).toLocaleString()}</DetailRow>
                                        <DetailRow label="Payment status">{paymentLabels[app.payment_status] || app.payment_status || 'Pending'}</DetailRow>
                                        {app.payment_method && <DetailRow label="Payment method">{humanize(app.payment_method)}</DetailRow>}
                                        {app.esewa_ref_id && <DetailRow label="eSewa ref ID">{app.esewa_ref_id}</DetailRow>}
                                        {app.esewa_transaction_uuid && <DetailRow label="Transaction UUID">{app.esewa_transaction_uuid}</DetailRow>}

                                        {app.admin_notes && (
                                            <>
                                                <SectionTitle>Admin notes</SectionTitle>
                                                <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', padding: '6px 0' }}>{app.admin_notes}</div>
                                            </>
                                        )}

                                        <SectionTitle>Timeline</SectionTitle>
                                        <DetailRow label="Created">{formatDate(app.created_at)}</DetailRow>
                                        <DetailRow label="Last updated">{formatDate(app.updated_at)}</DetailRow>
                                      </div>
                                    );
                                  })()}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
