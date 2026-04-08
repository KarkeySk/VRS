import { useEffect, useState } from 'react'
import { Map, User, Cog, Edit, AlertTriangle } from 'lucide-react'

const SETTINGS_KEY = 'bhatbhati_admin_settings_v1'

const defaultSettings = {
  thresholdMeters: '3500',
  steepness: '15',
  snowAlert: true,
  windAlert: false,
  autoPurge: true,
}

function readSavedSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    localStorage.removeItem(SETTINGS_KEY)
    return defaultSettings
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSettings(readSavedSettings())
  }, [])

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
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

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setError('')
    setMessage('Saved.')
  }

  const discard = () => {
    setSettings(readSavedSettings())
    setError('')
    setMessage('Changes reverted.')
  }

  const manualPurge = () => {
    const ok = window.confirm('Run manual cleanup now? This cannot be undone.')
    if (!ok) return
    setError('')
    setMessage('Manual cleanup queued. (Demo mode)')
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
            {[
              { title: 'Fleet Manager', desc: 'Can manage vehicles and routes', icon: User },
              { title: 'Booking Agent', desc: 'Can manage bookings', icon: User },
              { title: 'Tech Admin', desc: 'Can manage system settings', icon: Cog },
            ].map((role) => (
              <div key={role.title} className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                    <role.icon className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{role.title}</p>
                    <p className="text-xs text-txt-secondary">{role.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMessage(`Edit role: ${role.title} (coming soon).`)}
                  className="text-txt-secondary cursor-pointer hover:text-brand-orange transition-colors bg-transparent border-none"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMessage('Create Role clicked.')}
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
            className="w-full py-2.5 bg-status-red/20 border border-status-red/30 text-status-red rounded-md text-sm font-semibold hover:bg-status-red/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            Run Manual Cleanup
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={discard} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
          Discard Changes
        </button>
        <button type="button" onClick={save} className="btn-action px-8 py-2.5 text-sm">Save Changes</button>
      </div>
    </div>
  )
}
