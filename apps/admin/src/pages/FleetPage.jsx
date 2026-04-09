import { useEffect, useMemo, useState } from 'react'
import { Search, Truck, ToggleLeft, Trash2, PencilLine } from 'lucide-react'
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
  const [editVehicleId, setEditVehicleId] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    subtitle: '',
    type: '',
    price_per_day: '',
    image: '',
    is_available: true,
  })

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

  const openEdit = (vehicle) => {
    setEditVehicleId(vehicle.id)
    setEditForm({
      name: vehicle.name || '',
      subtitle: vehicle.subtitle || '',
      type: vehicle.type || '',
      price_per_day: String(vehicle.price_per_day ?? ''),
      image: vehicle.image || '',
      is_available: Boolean(vehicle.is_available),
    })
  }

  const cancelEdit = () => {
    setEditVehicleId('')
    setEditForm({
      name: '',
      subtitle: '',
      type: '',
      price_per_day: '',
      image: '',
      is_available: true,
    })
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editVehicleId) return
    if (!editForm.name.trim()) {
      setError('Vehicle name is required.')
      return
    }

    setIsSavingEdit(true)
    setError('')
    try {
      await vehicleService.update(editVehicleId, {
        name: editForm.name.trim(),
        subtitle: editForm.subtitle.trim() || null,
        type: editForm.type.trim() || null,
        price_per_day: Number(editForm.price_per_day || 0),
        image: editForm.image.trim() || null,
        is_available: Boolean(editForm.is_available),
      })
      cancelEdit()
      await loadVehicles()
    } catch (err) {
      setError(err.message || 'Failed to update vehicle details')
    } finally {
      setIsSavingEdit(false)
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

      {editVehicleId && (
        <form onSubmit={saveEdit} className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 mb-5">
          <p className="text-xs text-txt-secondary mb-3">Edit vehicle details</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Vehicle name"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              value={editForm.subtitle}
              onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Subtitle"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={editForm.type}
              onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
              placeholder="Type (bike/suv/jeep)"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm uppercase"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              value={editForm.price_per_day}
              onChange={(e) => setEditForm((p) => ({ ...p, price_per_day: e.target.value }))}
              placeholder="Price per day (NPR)"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={editForm.image}
              onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="Image URL"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-txt-secondary">Available</label>
              <input
                type="checkbox"
                checked={editForm.is_available}
                onChange={(e) => setEditForm((p) => ({ ...p, is_available: e.target.checked }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 text-sm rounded-md border border-dark-border text-txt-secondary hover:text-txt-primary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSavingEdit} className="btn-action px-5 py-2 text-sm disabled:opacity-60">
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
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
                        onClick={() => openEdit(v)}
                        className="px-2.5 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                        Edit
                      </button>
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
