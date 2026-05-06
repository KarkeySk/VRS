import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileService } from '@bhatbhati/shared/services/profileService.js'
import { Shield, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'

const terrainOptions = [
    { value: 'mountains', label: 'High Mountain Roads' },
    { value: 'valley', label: 'Valley Roads' },
    { value: 'offroad', label: 'Rough Off-road Trails' },
    { value: 'highway', label: 'Highways' },
]

export default function ProfilePage() {
    const { user, enrollMfa, challengeAndVerifyMfa, unenrollMfa, listMfaFactors } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [profile, setProfile] = useState(null)
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        terrain_preference: '',
    })

    // 2FA State
    const [mfaFactors, setMfaFactors] = useState([])
    const [mfaLoading, setMfaLoading] = useState(true)
    const [mfaEnrolling, setMfaEnrolling] = useState(false)
    const [mfaQrCode, setMfaQrCode] = useState(null)
    const [mfaSecret, setMfaSecret] = useState('')
    const [mfaFactorId, setMfaFactorId] = useState(null)
    const [mfaVerifyCode, setMfaVerifyCode] = useState('')
    const [mfaError, setMfaError] = useState('')
    const [mfaSuccess, setMfaSuccess] = useState('')
    const [mfaDisabling, setMfaDisabling] = useState(false)

    useEffect(() => {
        let isMounted = true
        const loadProfile = async () => {
            if (!user?.id) {
                setLoading(false)
                return
            }
            try {
                setError('')
                const data = await profileService.getById(user.id)
                if (!isMounted) return
                setProfile(data)
                setForm({
                    full_name: data?.full_name ?? user?.user_metadata?.full_name ?? '',
                    phone: data?.phone ?? '',
                    terrain_preference: data?.terrain_preference ?? user?.user_metadata?.terrain_preference ?? '',
                })
            } catch (err) {
                if (!isMounted) return
                setError(err.message || 'Could not load profile')
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        loadProfile()
        return () => {
            isMounted = false
        }
    }, [user?.id, user?.user_metadata?.full_name, user?.user_metadata?.terrain_preference])

    // Load MFA factors
    useEffect(() => {
        let mounted = true
        const loadMfa = async () => {
            try {
                const data = await listMfaFactors()
                if (!mounted) return
                const verified = data?.totp?.filter(f => f.status === 'verified') || []
                setMfaFactors(verified)
            } catch {
                // MFA not available or error
            } finally {
                if (mounted) setMfaLoading(false)
            }
        }
        loadMfa()
        return () => { mounted = false }
    }, [listMfaFactors])

    const initials = useMemo(() => {
        const name = form.full_name || user?.email || 'U'
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U'
    }, [form.full_name, user?.email])

    const handleSave = async (e) => {
        e.preventDefault()
        if (!user?.id) return
        try {
            setSaving(true)
            setError('')
            setSuccess('')
            const payload = {
                full_name: form.full_name.trim() || null,
                phone: form.phone.trim() || null,
                terrain_preference: form.terrain_preference || null,
            }
            const updated = await profileService.update(user.id, payload)
            setProfile(updated)
            setSuccess('Profile updated.')
        } catch (err) {
            setError(err.message || 'Could not update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !user?.id) return
        if (file.size > 5 * 1024 * 1024) {
            setError('Photo is too large. Use a file under 5MB.')
            return
        }
        try {
            setUploading(true)
            setError('')
            setSuccess('')
            const avatarUrl = await profileService.uploadAvatar(user.id, file)
            const updated = await profileService.update(user.id, { avatar_url: avatarUrl })
            setProfile(updated)
            setSuccess('Photo updated.')
        } catch (err) {
            setError(err.message || 'Could not upload photo')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    // 2FA Handlers
    const handleEnrollMfa = async () => {
        setMfaError('')
        setMfaSuccess('')
        setMfaEnrolling(true)
        try {
            const data = await enrollMfa()
            setMfaQrCode(data.totp.qr_code)
            setMfaSecret(data.totp.secret)
            setMfaFactorId(data.id)
        } catch (err) {
            setMfaError(err.message || 'Failed to start 2FA enrollment')
            setMfaEnrolling(false)
        }
    }

    const handleVerifyMfaEnrollment = async (e) => {
        e.preventDefault()
        setMfaError('')
        if (mfaVerifyCode.length !== 6) {
            setMfaError('Please enter a valid 6-digit code')
            return
        }
        try {
            await challengeAndVerifyMfa(mfaFactorId, mfaVerifyCode)
            setMfaSuccess('Two-Factor Authentication enabled successfully!')
            setMfaQrCode(null)
            setMfaSecret('')
            setMfaVerifyCode('')
            setMfaEnrolling(false)
            // Refresh factors
            const data = await listMfaFactors()
            const verified = data?.totp?.filter(f => f.status === 'verified') || []
            setMfaFactors(verified)
        } catch (err) {
            setMfaError(err.message || 'Invalid verification code. Please try again.')
        }
    }

    const handleDisableMfa = async (factorId) => {
        setMfaError('')
        setMfaSuccess('')
        setMfaDisabling(true)
        try {
            await unenrollMfa(factorId)
            setMfaSuccess('Two-Factor Authentication has been disabled.')
            setMfaFactors(prev => prev.filter(f => f.id !== factorId))
        } catch (err) {
            setMfaError(err.message || 'Failed to disable 2FA')
        } finally {
            setMfaDisabling(false)
        }
    }

    const handleCancelEnrollment = () => {
        setMfaQrCode(null)
        setMfaSecret('')
        setMfaVerifyCode('')
        setMfaFactorId(null)
        setMfaEnrolling(false)
        setMfaError('')
    }

    if (loading) {
        return (
            <div style={{ paddingTop: '110px', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <div style={{ marginBottom: '28px' }}>
                    <p style={{ color: '#e8732a', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Account
                    </p>
                    <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '8px' }}>My Profile</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>See and update your account info.</p>
                </div>

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        marginBottom: '16px',
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: '#22c55e',
                        fontSize: '0.85rem',
                    }}>
                        {success}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile avatar"
                                    style={{ width: '96px', height: '96px', borderRadius: '999px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
                                />
                            ) : (
                                <div style={{
                                    width: '96px',
                                    height: '96px',
                                    borderRadius: '999px',
                                    background: 'var(--brand-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#111',
                                    fontWeight: '800',
                                    fontSize: '1.6rem',
                                }}>
                                    {initials}
                                </div>
                            )}

                            <h2 style={{ color: 'var(--text-primary)', margin: '14px 0 4px', fontSize: '1.1rem' }}>{form.full_name || 'No Name'}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>{user?.email}</p>

                            <label style={{
                                marginTop: '14px',
                                display: 'inline-block',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                color: 'var(--accent-ink)',
                                background: 'var(--brand-gradient)',
                                padding: '9px 14px',
                                borderRadius: '999px',
                                opacity: uploading ? 0.7 : 1,
                            }}>
                                {uploading ? 'Uploading...' : 'Change Photo'}
                                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </section>

                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        padding: '20px',
                    }}>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                <Field label="Full Name">
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                        placeholder="Your full name"
                                        style={inputStyle}
                                    />
                                </Field>

                                <Field label="Email">
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
                                    />
                                </Field>

                                <Field label="Phone">
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+977 ..."
                                        style={inputStyle}
                                    />
                                </Field>

                                <Field label="Road Preference">
                                    <select
                                        value={form.terrain_preference}
                                        onChange={(e) => setForm((prev) => ({ ...prev, terrain_preference: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="">Select road...</option>
                                        {terrainOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Role">
                                    <input
                                        value={profile?.role || 'user'}
                                        disabled
                                        style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', textTransform: 'capitalize' }}
                                    />
                                </Field>

                                <Field label="Member Since">
                                    <input
                                        value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                        disabled
                                        style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
                                    />
                                </Field>
                            </div>

                            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '11px 20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: 'var(--accent-ink)',
                                        background: 'var(--brand-gradient)',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* 2FA Security Section */}
                <section style={{
                    marginTop: '24px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Shield size={22} style={{ color: 'var(--accent, #e8732a)' }} />
                        <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Two-Factor Authentication</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                        Add an extra layer of security to your account. When enabled, you will need to enter a 6-digit code from your authenticator app each time you sign in.
                    </p>

                    {mfaError && (
                        <div style={{
                            marginBottom: '14px',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                        }}>
                            {mfaError}
                        </div>
                    )}

                    {mfaSuccess && (
                        <div style={{
                            marginBottom: '14px',
                            background: 'rgba(34,197,94,0.08)',
                            border: '1px solid rgba(34,197,94,0.25)',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            color: '#22c55e',
                            fontSize: '0.85rem',
                        }}>
                            {mfaSuccess}
                        </div>
                    )}

                    {mfaLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Loading security settings...
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : mfaFactors.length > 0 ? (
                        /* 2FA is ENABLED */
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                background: 'rgba(34,197,94,0.06)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: '14px',
                                marginBottom: '14px',
                            }}>
                                <ShieldCheck size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>2FA is Active</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '2px 0 0' }}>Your account is protected with TOTP authentication.</p>
                                </div>
                            </div>
                            {mfaFactors.map(factor => (
                                <div key={factor.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: 'var(--bg-glass)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                }}>
                                    <div>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem', margin: 0 }}>Authenticator App</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '2px 0 0' }}>
                                            Added {factor.created_at ? new Date(factor.created_at).toLocaleDateString() : 'recently'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDisableMfa(factor.id)}
                                        disabled={mfaDisabling}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            borderRadius: '999px',
                                            padding: '8px 16px',
                                            fontSize: '0.78rem',
                                            fontWeight: '700',
                                            color: '#ef4444',
                                            background: 'rgba(239,68,68,0.06)',
                                            cursor: mfaDisabling ? 'not-allowed' : 'pointer',
                                            opacity: mfaDisabling ? 0.6 : 1,
                                        }}
                                    >
                                        <ShieldOff size={14} />
                                        {mfaDisabling ? 'Disabling...' : 'Disable 2FA'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : mfaQrCode ? (
                        /* QR Code enrollment step */
                        <div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                background: 'var(--bg-glass)',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                            }}>
                                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>
                                    Scan this QR code with your authenticator app
                                </p>
                                <div style={{
                                    background: '#fff',
                                    padding: '12px',
                                    borderRadius: '12px',
                                }}>
                                    <img src={mfaQrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 6px' }}>Or enter this secret manually:</p>
                                    <code style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        fontSize: '0.75rem',
                                        color: 'var(--accent, #e8732a)',
                                        fontFamily: 'monospace',
                                        letterSpacing: '2px',
                                        wordBreak: 'break-all',
                                    }}>
                                        {mfaSecret}
                                    </code>
                                </div>

                                <form onSubmit={handleVerifyMfaEnrollment} style={{ width: '100%', maxWidth: '280px' }}>
                                    <label style={{ display: 'block', color: '#999', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Enter 6-digit verification code
                                    </label>
                                    <input
                                        type="text"
                                        value={mfaVerifyCode}
                                        onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        style={{
                                            ...inputStyle,
                                            textAlign: 'center',
                                            fontSize: '1.2rem',
                                            letterSpacing: '8px',
                                            fontWeight: '700',
                                        }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                                        <button
                                            type="button"
                                            onClick={handleCancelEnrollment}
                                            style={{
                                                flex: 1,
                                                border: '1px solid var(--border)',
                                                borderRadius: '999px',
                                                padding: '10px',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                color: 'var(--text-secondary)',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={mfaVerifyCode.length !== 6}
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                borderRadius: '999px',
                                                padding: '10px',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                color: 'var(--accent-ink)',
                                                background: 'var(--brand-gradient)',
                                                cursor: mfaVerifyCode.length !== 6 ? 'not-allowed' : 'pointer',
                                                opacity: mfaVerifyCode.length !== 6 ? 0.5 : 1,
                                            }}
                                        >
                                            Verify & Enable
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* 2FA is DISABLED — show enable button */
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                background: 'rgba(239,68,68,0.04)',
                                border: '1px solid rgba(239,68,68,0.15)',
                                borderRadius: '14px',
                                marginBottom: '16px',
                            }}>
                                <ShieldOff size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                                <div>
                                    <p style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>2FA is Not Active</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '2px 0 0' }}>We recommend enabling 2FA for enhanced security.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEnrollMfa}
                                disabled={mfaEnrolling}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: 'none',
                                    borderRadius: '999px',
                                    padding: '11px 22px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: 'var(--accent-ink)',
                                    background: 'var(--brand-gradient)',
                                    cursor: mfaEnrolling ? 'not-allowed' : 'pointer',
                                    opacity: mfaEnrolling ? 0.7 : 1,
                                }}
                            >
                                <ShieldCheck size={16} />
                                {mfaEnrolling ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{ display: 'block', color: '#999', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {label}
            </label>
            {children}
        </div>
    )
}

const inputStyle = {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'var(--bg-glass)',
    color: 'var(--text-primary)',
    padding: '11px 12px',
    fontSize: '0.85rem',
    outline: 'none',
}
