import { useEffect, useMemo, useState } from 'react'
import { Search, Truck, ToggleLeft, Trash2 } from 'lucide-react'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'

const availabilityStyles = {
  true: 'bg-status-green/20 text-status-green',
  false: 'bg-status-red/20 text-status-red',
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadVehicles = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await vehicleService.getAllForAdmin()
      setVehicles(data ?? [])
    } catch (err) {
      setError(err.message || 'Failed to load vehicles')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter((v) => {
      const name = `${v.name ?? ''} ${v.subtitle ?? ''}`.toLowerCase()
      const type = `${v.type ?? ''}`.toLowerCase()
      return name.includes(q) || type.includes(q)
    })
  }, [vehicles, query])

  const total = vehicles.length
  const availableCount = vehicles.filter((v) => v.is_available).length
  const unavailableCount = total - availableCount

  const handleToggleAvailability = async (vehicle) => {
    setBusyId(vehicle.id)
    try {
      await vehicleService.update(vehicle.id, { is_available: !vehicle.is_available })
      await loadVehicles()
    } catch (err) {
      setError(err.message || 'Failed to update vehicle')
    } finally {
      setBusyId('')
    }
  }

  const handleDelete = async (vehicle) => {
    const ok = window.confirm(`Delete vehicle "${vehicle.name}"?`)
    if (!ok) return

    setBusyId(vehicle.id)
    try {
      await vehicleService.delete(vehicle.id)
      await loadVehicles()
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Fleet Overview</h2>
      <p className="text-sm text-txt-secondary mb-6">Live inventory from Supabase.</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center">
          <Truck className="w-8 h-8 mx-auto mb-3 text-brand-orange" />
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Total Fleet</p>
          <p className="text-4xl font-bold">{total}</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center">
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Available</p>
          <p className="text-4xl font-bold text-status-green">{availableCount}</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 text-center">
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">Unavailable</p>
          <p className="text-4xl font-bold text-status-red">{unavailableCount}</p>
        </div>
      </div>

      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Inventory Pipeline</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or type..."
              className="bg-dark border border-dark-border rounded-md pl-9 pr-4 py-1.5 text-xs text-txt-primary placeholder-txt-secondary w-56"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-txt-secondary">Loading vehicles...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
                <th className="pb-3 font-semibold">Vehicle</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Price/Day</th>
                <th className="pb-3 font-semibold">Availability</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} className={i < filtered.length - 1 ? 'border-b border-dark-border/50' : ''}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-dark-border flex items-center justify-center">
                          <Truck className="w-5 h-5 text-txt-secondary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{v.name}</p>
                        <p className="text-xs text-txt-secondary">{v.subtitle || 'No subtitle'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-txt-secondary uppercase">{v.type || '-'}</td>
                  <td>NPR {Number(v.price_per_day || 0).toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${availabilityStyles[String(v.is_available)]}`}>
                      {v.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => handleToggleAvailability(v)}
                        className="px-2.5 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <ToggleLeft className="w-3.5 h-3.5" />
                        Toggle
                      </button>
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => handleDelete(v)}
                        className="px-2.5 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
