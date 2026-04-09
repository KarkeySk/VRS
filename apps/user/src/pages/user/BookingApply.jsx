import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inquiryService } from '@bhatbhati/shared/services/inquiryService.js';
import { applicationService } from '@bhatbhati/shared/services/applicationService.js';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';

const DRIVER_FEE_PER_DAY = 2000

export default function BookingApply() {
    const { inquiryId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // Form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseFile, setLicenseFile] = useState(null);
    const [idFile, setIdFile] = useState(null);

    // Questionnaire
    const [experience, setExperience] = useState('');
    const [groupSize, setGroupSize] = useState('');
    const [purpose, setPurpose] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');

    useEffect(() => {
        inquiryService.getById(inquiryId)
            .then(setInquiry)
            .catch(() => setError('Request not found'))
            .finally(() => setLoading(false));
    }, [inquiryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (!startDate || !endDate || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                throw new Error('Please choose valid start and end dates.');
            }
            if (end < start) {
                throw new Error('End date cannot be earlier than start date.');
            }

            let licenseUrl = '';
            let idUrl = '';
            if (licenseFile) licenseUrl = await applicationService.uploadDocument(user.id, licenseFile, 'license');
            if (idFile) idUrl = await applicationService.uploadDocument(user.id, idFile, 'id');

            const days = Math.max(1, Math.ceil((end - start) / 86400000));
            const basePrice = inquiry.vehicles?.price_per_day || 0;
            const addonsTotal = (inquiry.selected_addons || []).reduce((s, a) => s + (a.price || 0), 0);
            const driverFee = inquiry.drive_type === 'with-driver' ? DRIVER_FEE_PER_DAY * days : 0;
            const totalPrice = (basePrice * days) + addonsTotal + driverFee;

            const app = await applicationService.create({
                inquiry_id: inquiryId,
                user_id: user.id,
                vehicle_id: inquiry.vehicle_id,
                start_date: startDate,
                end_date: endDate,
                drive_type: inquiry.drive_type,
                license_number: licenseNumber,
                license_doc_url: licenseUrl,
                id_doc_url: idUrl,
                selected_addons: inquiry.selected_addons || [],
                total_price: totalPrice,
                questionnaire: { experience, group_size: groupSize, purpose, medical_conditions: medicalConditions, emergency_contact: emergencyContact },
            });

            navigate(`/booking/confirm/${app.id}`);
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (!inquiry) return <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: '#ef4444' }}>Request not found</div>;

    const labelStyle = { display: 'block', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' };
    const inputStyle = {
        width: '100%', padding: '13px 16px', background: 'var(--bg-glass)',
        border: '1px solid var(--border)', borderRadius: '14px',
        color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Complete Booking</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '32px' }}>
                    Vehicle: <span style={{ color: '#e8732a', fontWeight: '600' }}>{inquiry.vehicles?.name}</span> — {inquiry.drive_type === 'with-driver' ? 'With Driver' : 'Self Drive'}
                </p>

                {/* Step indicators */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '36px' }}>
                    {['Dates & Docs', 'Questions'].map((s, i) => (
                        <div key={i} onClick={() => setStep(i + 1)} style={{
                            flex: 1, padding: '12px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                            background: step === i + 1 ? 'rgba(232,115,42,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${step === i + 1 ? '#e8732a' : 'rgba(255,255,255,0.06)'}`,
                            color: step === i + 1 ? '#e8732a' : '#666', fontSize: '0.8rem', fontWeight: '600',
                        }}>
                            Step {i + 1}: {s}
                        </div>
                    ))}
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '20px', color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            const nextStart = e.target.value;
                                            setStartDate(nextStart);
                                            if (endDate && nextStart && endDate < nextStart) {
                                                setEndDate(nextStart);
                                            }
                                        }}
                                        required
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            {inquiry.drive_type === 'self-drive' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>License Number</label>
                                    <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. DL-2024-12345" required style={inputStyle} />
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>{inquiry.drive_type === 'self-drive' ? 'Driving License (Photo/PDF)' : 'ID Document (Photo/PDF)'}</label>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
                                    background: 'var(--bg-glass)', border: '1px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '14px', cursor: 'pointer', transition: 'border-color 0.2s',
                                }}>
                                    <Upload size={20} color="#888" />
                                    <div>
                                        <div style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {inquiry.drive_type === 'self-drive' ? (licenseFile?.name || 'Upload license') : (idFile?.name || 'Upload ID')}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>JPG, PNG, or PDF — max 5MB</div>
                                    </div>
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => inquiry.drive_type === 'self-drive' ? setLicenseFile(e.target.files[0]) : setIdFile(e.target.files[0])} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {inquiry.drive_type === 'self-drive' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>ID Document (Citizenship/Passport)</label>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
                                        background: 'var(--bg-glass)', border: '1px dashed rgba(255,255,255,0.1)',
                                        borderRadius: '14px', cursor: 'pointer',
                                    }}>
                                        <FileText size={20} color="#888" />
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: '600' }}>{idFile?.name || 'Upload ID document'}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>JPG, PNG, or PDF — max 5MB</div>
                                        </div>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files[0])} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            )}

                            <button type="button" onClick={() => setStep(2)} style={{
                                width: '100%', padding: '15px', border: 'none', borderRadius: '14px',
                                background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                                fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                            }}>
                                Continue to Questions
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Driving Experience</label>
                                <select value={experience} onChange={(e) => setExperience(e.target.value)} required style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', color: experience ? '#fff' : '#555' }}>
                                    <option value="" disabled>Select level</option>
                                    <option value="beginner">Beginner (0-2 years)</option>
                                    <option value="intermediate">Intermediate (2-5 years)</option>
                                    <option value="experienced">Experienced (5+ years)</option>
                                    <option value="professional">Professional Driver</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Group Size</label>
                                <input type="number" min="1" max="15" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} placeholder="Number of people" required style={inputStyle} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Trip Purpose</label>
                                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} required style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', color: purpose ? '#fff' : '#555' }}>
                                    <option value="" disabled>Select purpose</option>
                                    <option value="tourism">Tourism / Sightseeing</option>
                                    <option value="trekking">Trekking Base Camp Transfer</option>
                                    <option value="business">Business Travel</option>
                                    <option value="photography">Photography</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Medical Notes (if any)</label>
                                <textarea value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} placeholder="Any sickness history, allergies, etc." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={labelStyle}>Emergency Contact</label>
                                <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Name — Phone number" required style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setStep(1)} style={{
                                    flex: 1, padding: '15px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: '600',
                                    background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer',
                                }}>
                                    Back
                                </button>
                                <button type="submit" disabled={submitting} style={{
                                    flex: 2, padding: '15px', border: 'none', borderRadius: '14px',
                                    background: 'var(--brand-gradient)', color: 'var(--accent-ink)',
                                    fontSize: '0.9rem', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}>
                                    {submitting ? 'Sending...' : <><CheckCircle size={16} /> Send Request</>}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
