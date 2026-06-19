import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@bhatbhati/shared/services/authService.js'
import { profileService } from '@bhatbhati/shared/services/profileService.js'
import { getFriendlyAuthError, getPasswordError } from '@bhatbhati/shared/utils/authFeedback.js'
import {
  User,
  Lock,
  Mail,
  Phone,
  Globe,
  Camera,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle,
} from 'lucide-react'

export default function AdminProfilePage({ onNavigate }) {
  // Router navigation for sign-out and redirects.
  const navigate = useNavigate()
  // Ref to trigger file selection.
  const avatarInputRef = useRef(null)

  // Toggle visibility for password fields.
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Profile fields shown in the form.
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    displayName: 'Admin',
    email: '',
    phone: '',
    timezone: 'Asia/Kathmandu (NPT +05:45)',
    role: 'Super Admin',
    avatarUrl: '',
  })

  // Password form state.
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  // UI state for messages and loading.
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    // Hydrate profile from auth + profile services.
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const user = await authService.getUser()
        if (!user) {
          navigate('/login', { replace: true })
          return
        }
        const dbProfile = await profileService.getById(user.id)
        const fullName = dbProfile?.full_name || 'Admin User'
        const displayName = fullName.split(' ')[0] || 'Admin'

        setProfile((prev) => ({
          ...prev,
          fullName,
          displayName,
          email: user.email || '',
          phone: dbProfile?.phone || '',
          role: dbProfile?.role === 'admin' ? 'Super Admin' : 'User',
          avatarUrl: dbProfile?.avatar_url || '',
        }))
      } catch (err) {
        setError(getFriendlyAuthError(err, 'Failed to load profile. Please try again.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  // Update a single profile field locally.
  const updateProfileField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = async () => {
    // Persist profile changes.
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const user = await authService.getUser()
      if (!user) {
        setError('You are signed out. Please log in again.')
        return
      }

      await profileService.update(user.id, {
        full_name: profile.fullName,
        phone: profile.phone,
      })

      if (profile.email && profile.email !== user.email) {
        setMessage('Profile saved. Email update requires secure verification in Supabase Auth.')
      } else {
        setMessage('Profile changes saved.')
      }
    } catch (err) {
      setError(getFriendlyAuthError(err, 'Failed to save profile. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  // Update password via auth service.
  const updatePassword = async () => {
    setPasswordSaving(true)
    setError('')
    setMessage('')
    try {
      if (!passwords.current || !passwords.next || !passwords.confirm) {
        setError('Please fill all password fields.')
        return
      }
      const passwordError = getPasswordError(passwords.next)
      if (passwordError) {
        setError(passwordError)
        return
      }
      if (passwords.next !== passwords.confirm) {
        setError('New password and confirm password do not match.')
        return
      }

      const currentUser = await authService.getUser()
      if (!currentUser?.email) {
        setError('Session missing. Please log in again.')
        return
      }

      await authService.signIn(currentUser.email, passwords.current)
      await authService.updatePassword(passwords.next)

      setPasswords({ current: '', next: '', confirm: '' })
      setMessage('Password updated successfully.')
    } catch (err) {
      setError(getFriendlyAuthError(err, 'Failed to update password. Please try again.'))
    } finally {
      setPasswordSaving(false)
    }
  }

  // Upload and save the profile avatar.
  const handleAvatarUpload = async (file) => {
    if (!file) return
    setError('')
    setMessage('')
    try {
      const user = await authService.getUser()
      if (!user) {
        setError('Session missing. Please log in again.')
        return
      }
      const avatarUrl = await profileService.uploadAvatar(user.id, file)
      await profileService.update(user.id, { avatar_url: avatarUrl })
      setProfile((prev) => ({ ...prev, avatarUrl }))
      setMessage('Avatar updated.')
    } catch (err) {
      setError(getFriendlyAuthError(err, 'Failed to upload avatar. Please try again.'))
    }
  }

  // Sign the user out and return to login.
  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await authService.signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getFriendlyAuthError(err, 'We could not sign you out. Please try again.'))
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-txt-secondary">Loading profile...</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Admin Profile</h2>
        <span className="text-sm text-txt-secondary">Account Settings</span>
      </div>

      {error && <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">{error}</div>}
      {message && <div className="mb-4 rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-xs text-status-green">{message}</div>}

      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <div className="flex items-start gap-6">
              <div className="relative group">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Admin avatar" className="w-24 h-24 rounded-xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-brand-orange flex items-center justify-center text-3xl font-bold text-dark">
                    <User className="w-12 h-12" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-xl bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-none"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-status-green rounded-full border-2 border-dark-deeper" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{profile.displayName || 'Admin'}</h3>
                <p className="text-sm text-brand-orange font-semibold mb-3">Fleet Director</p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-brand-orange/20 text-brand-orange text-[10px] font-bold rounded-full uppercase">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Full Name</label>
                <input type="text" value={profile.fullName} onChange={(e) => updateProfileField('fullName', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Display Name</label>
                <input type="text" value={profile.displayName} onChange={(e) => updateProfileField('displayName', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input type="email" value={profile.email} onChange={(e) => updateProfileField('email', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input type="tel" value={profile.phone} onChange={(e) => updateProfileField('phone', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Timezone
                </label>
                <input type="text" value={profile.timezone} onChange={(e) => updateProfileField('timezone', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Role</label>
                <input type="text" value={`Fleet Director — ${profile.role}`} readOnly className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-secondary cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-orange" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">New Password</label>
                  <div className="relative">
                    <input type={showNewPw ? 'text' : 'password'} value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmPw ? 'text' : 'password'} value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-dark-deeper rounded-lg p-3">
                <p className="text-[10px] text-txt-secondary uppercase tracking-wider font-semibold mb-2">Password Requirements</p>
                <div className="grid grid-cols-2 gap-1">
                  {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number or symbol'].map((req) => (
                    <span key={req} className="text-[11px] text-txt-secondary flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-txt-muted" /> {req}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" onClick={updatePassword} disabled={passwordSaving} className="btn-action px-6 py-2.5 text-sm disabled:opacity-60">
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={handleSignOut} disabled={signingOut} className="flex items-center gap-2 text-sm text-status-red hover:text-status-red/80 bg-transparent border-none cursor-pointer font-semibold disabled:opacity-60">
              <LogOut className="w-4 h-4" /> {signingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => onNavigate('dashboard')} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={saveProfile} disabled={saving} className="btn-action px-8 py-2.5 text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Account Overview</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-orange flex items-center justify-center">
                  <User className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <p className="text-sm font-bold">{profile.displayName || 'Admin'}</p>
                  <p className="text-[10px] text-txt-secondary">Fleet Director</p>
                </div>
              </div>
              <div className="border-t border-dark-border pt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-txt-secondary">Role</span><span className="text-brand-orange font-semibold">{profile.role}</span></div>
                <div className="flex justify-between text-xs"><span className="text-txt-secondary">Email</span><span className="text-txt-primary font-semibold truncate max-w-[150px]">{profile.email || '—'}</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
