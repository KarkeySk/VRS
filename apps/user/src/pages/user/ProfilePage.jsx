import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileService } from '@bhatbhati/shared/services/profileService.js'

const terrainOptions = [
    { value: 'mountains', label: 'High Mountain Roads' },
    { value: 'valley', label: 'Valley Roads' },
    { value: 'offroad', label: 'Rough Off-road Trails' },
    { value: 'highway', label: 'Highways' },
]

export default function ProfilePage() {
    const { user } = useAuth()
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
