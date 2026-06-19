import { useEffect, useState } from 'react'
import { Map, User, Edit, AlertTriangle, Trash2, X } from 'lucide-react'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'

// localStorage key for admin settings.
const SETTINGS_KEY = 'bhatbhati_admin_settings_v1'
// localStorage key for custom user roles.
const ROLES_KEY = 'bhatbhati_admin_roles_v1'

// Months after which finished bookings are eligible for cleanup.
const PURGE_AFTER_MONTHS = 6

// Defaults used for first load and reset.
const defaultSettings = {
  thresholdMeters: '3500',
  steepness: '15',
  snowAlert: true,
  windAlert: false,
  autoPurge: true,
}

// Seed roles shown until the admin customizes them.
const defaultRoles = [
  { id: 'fleet-manager', title: 'Fleet Manager', desc: 'Can manage vehicles and routes' },
  { id: 'booking-agent', title: 'Booking Agent', desc: 'Can manage bookings' },
  { id: 'tech-admin', title: 'Tech Admin', desc: 'Can manage system settings' },
]

function readSavedSettings() {
  // Settings persist in localStorage on this device.
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    localStorage.removeItem(SETTINGS_KEY)
    return defaultSettings
  }
}

function readSavedRoles() {
  const raw = localStorage.getItem(ROLES_KEY)
  if (!raw) return defaultRoles
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : defaultRoles
  } catch {
    localStorage.removeItem(ROLES_KEY)
    return defaultRoles
  }
}

export default function SettingsPage() {
  // Settings form state.
  const [settings, setSettings] = useState(defaultSettings)
  // Persistent custom roles.
  const [roles, setRoles] = useState(defaultRoles)
  // Role currently being edited/created in the modal (null = closed).
  const [editingRole, setEditingRole] = useState(null)
  // Cleanup in-progress flag.
  const [purging, setPurging] = useState(false)
  // Inline feedback states.
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Load saved settings and roles on mount.
    setSettings(readSavedSettings())
    setRoles(readSavedRoles())
  }, [])

  // Persist roles and update state together.
  const persistRoles = (next) => {
    setRoles(next)
    localStorage.setItem(ROLES_KEY, JSON.stringify(next))
  }

  const saveRole = (role) => {
    const title = role.title.trim()
    if (!title) {
      setError('Role name is required.')
      return
    }
    const exists = roles.some((r) => r.id === role.id)
    const next = exists
      ? roles.map((r) => (r.id === role.id ? { ...role, title } : r))
      : [...roles, { ...role, title, id: role.id || `role-${Date.now()}` }]
    persistRoles(next)
    setEditingRole(null)
    setError('')
    setMessage(exists ? 'Role updated.' : 'Role created.')
  }

  const deleteRole = (id) => {
    if (!window.confirm('Delete this role?')) return
    persistRoles(roles.filter((r) => r.id !== id))
    setMessage('Role deleted.')
  }

  // Update a single setting key.
  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    // Validate numeric settings before saving.
    const threshold = Number(settings.thresholdMeters)
    const steepness = Number(settings.steepness)

    if (!Number.isFinite(threshold) || threshold <= 0) {
      setError('Height limit must be a number over 0.')
      setMessage('')
      return
    }
    if (!Number.isFinite(steepness) || steepness <= 0) {
      setError('Steepness must be a number over 0.')
      setMessage('')
      return
    }

    // Persist the settings in localStorage.
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setError('')
    setMessage('Saved.')
  }

  const discard = () => {
    // Reset to the last saved values.
    setSettings(readSavedSettings())
    setError('')
    setMessage('Changes reverted.')
  }

  const manualPurge = async () => {
    // Confirm destructive action with the user.
    const ok = window.confirm(
      `Permanently delete completed and cancelled bookings older than ${PURGE_AFTER_MONTHS} months? This cannot be undone.`,
    )
    if (!ok) return
    setError('')
    setMessage('')
    setPurging(true)
    try {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - PURGE_AFTER_MONTHS)
      const removed = await bookingService.purgeFinishedBefore(cutoff)
      setMessage(
        removed > 0
          ? `Cleanup complete. Removed ${removed} old ${removed === 1 ? 'booking' : 'bookings'}.`
          : 'Cleanup complete. No old bookings to remove.',
      )
    } catch (err) {
      setError(err.message || 'Cleanup failed.')
    } finally {
      setPurging(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Route Settings</h2>
        <span className="px-3 py-1.5 border border-brand-orange text-brand-orange rounded-md text-xs font-semibold uppercase tracking-wider">
          Global Limits
        </span>
      </div>
      <p className="text-sm text-txt-secondary mb-6">Set simple rules for routes and weather.</p>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">{error}</div>
      )}
      {message && (
        <div className="mb-4 rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-xs text-status-green">{message}</div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-6 mb-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-orange/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-brand-orange" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-orange">{settings.thresholdMeters}m</p>
              <p className="text-xs text-txt-secondary uppercase">Current Limit</p>
            </div>
          </div>
          <h3 className="text-base font-semibold mb-2">4WD Rule</h3>
          <p className="text-xs text-txt-secondary mb-6 leading-relaxed">
            Use 4WD when route height or slope is high.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-t border-dark-border pt-3">
              <span className="text-sm text-txt-secondary">Height Limit (Meters)</span>
              <input
                type="number"
                value={settings.thresholdMeters}
                onChange={(e) => update('thresholdMeters', e.target.value)}
                className="w-24 bg-dark-deeper border border-dark-border rounded px-3 py-1 text-sm text-right text-txt-primary"
              />
            </div>
            <div className="flex items-center justify-between border-t border-dark-border pt-3">
              <span className="text-sm text-txt-secondary">Slope Limit (%)</span>
              <input
                type="number"
                value={settings.steepness}
                onChange={(e) => update('steepness', e.target.value)}
                className="w-24 bg-dark-deeper border border-dark-border rounded px-3 py-1 text-sm text-right text-txt-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-base font-semibold mb-2">Weather Alerts</h3>
          <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
            Auto stop rides when weather is bad.
          </p>
          <div className="text-5xl text-center mb-4">❄️</div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => update('snowAlert', !settings.snowAlert)}
              className="w-full flex items-center justify-between bg-dark-deeper rounded-lg px-3 py-2.5 border border-dark-border"
            >
              <span className="text-xs">❄ Snowfall &gt; 5cm</span>
              <div className={`w-10 h-5 rounded-full relative ${settings.snowAlert ? 'bg-brand-orange' : 'bg-dark-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full ${settings.snowAlert ? 'right-0.5 bg-white' : 'left-0.5 bg-txt-secondary'}`} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => update('windAlert', !settings.windAlert)}
              className="w-full flex items-center justify-between bg-dark-deeper rounded-lg px-3 py-2.5 border border-dark-border"
            >
              <span className="text-xs">💨 Gale &gt; 40km/h</span>
              <div className={`w-10 h-5 rounded-full relative ${settings.windAlert ? 'bg-brand-orange' : 'bg-dark-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full ${settings.windAlert ? 'right-0.5 bg-white' : 'left-0.5 bg-txt-secondary'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">User Roles</h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{role.title}</p>
                    <p className="text-xs text-txt-secondary">{role.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRole({ ...role })}
                    className="text-txt-secondary cursor-pointer hover:text-brand-orange transition-colors bg-transparent border-none"
                    title="Edit role"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRole(role.id)}
                    className="text-txt-secondary cursor-pointer hover:text-status-red transition-colors bg-transparent border-none"
                    title="Delete role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEditingRole({ id: '', title: '', desc: '' })}
            className="w-full mt-4 py-2 text-brand-orange text-sm font-semibold hover:text-brand-orange-dark transition-colors bg-transparent border-none cursor-pointer"
          >
            + Create Custom Role
          </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Privacy & Cleanup</h3>
          <div className="border border-status-red/30 rounded-lg p-4 mb-4">
            <p className="text-xs text-status-red uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Risky Actions
            </p>
            <p className="text-xs text-txt-secondary leading-relaxed">
              Remove old user data after trips finish.
            </p>
          </div>
          <div className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-semibold">Auto Clean Old Records</p>
              <p className="text-xs text-txt-secondary">Remove data older than 6 months</p>
            </div>
            <button
              type="button"
              onClick={() => update('autoPurge', !settings.autoPurge)}
              className={`w-10 h-5 rounded-full relative ${settings.autoPurge ? 'bg-brand-orange' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full ${settings.autoPurge ? 'right-0.5 bg-white' : 'left-0.5 bg-txt-secondary'}`} />
            </button>
          </div>
          <button
            type="button"
            onClick={manualPurge}
            disabled={purging}
            className="w-full py-2.5 bg-status-red/20 border border-status-red/30 text-status-red rounded-md text-sm font-semibold hover:bg-status-red/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {purging ? 'Cleaning up…' : 'Run Manual Cleanup'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={discard} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
          Discard Changes
        </button>
        <button type="button" onClick={save} className="btn-action px-8 py-2.5 text-sm">Save Changes</button>
      </div>

      {editingRole && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-dark border border-dark-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{roles.some((r) => r.id === editingRole.id) ? 'Edit Role' : 'Create Role'}</h3>
              <button type="button" onClick={() => setEditingRole(null)} className="bg-transparent border-none text-txt-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-txt-secondary mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={editingRole.title}
                  onChange={(e) => setEditingRole((r) => ({ ...r, title: e.target.value }))}
                  placeholder="e.g. Dispatch Lead"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2 text-sm text-txt-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-txt-secondary mb-1.5">Description</label>
                <input
                  type="text"
                  value={editingRole.desc}
                  onChange={(e) => setEditingRole((r) => ({ ...r, desc: e.target.value }))}
                  placeholder="What can this role do?"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2 text-sm text-txt-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button type="button" onClick={() => setEditingRole(null)} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => saveRole(editingRole)} className="btn-action px-6 py-2 text-sm">Save Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
