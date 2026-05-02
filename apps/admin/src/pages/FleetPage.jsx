import { useEffect, useMemo, useState } from 'react'
import { Search, Truck, ToggleLeft, Trash2, PencilLine, Upload } from 'lucide-react'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'

// Styles for availability badges.
const availabilityStyles = {
  true: 'bg-status-green/20 text-status-green',
  false: 'bg-status-red/20 text-status-red',
}

const categories = [
  { id: 'bike', title: 'Motorbike', desc: 'Road and tour' },
  { id: 'suv', title: 'SUV', desc: 'High road support' },
  { id: 'jeep', title: 'Jeep', desc: 'Mountain trip' },
  { id: 'pickup', title: 'Pickup', desc: 'Cargo and load' },
  { id: 'car', title: 'Car', desc: 'City and transfer' },
]

const makeOptions = ['Royal Enfield', 'Honda', 'Yamaha', 'KTM', 'Suzuki', 'Bajaj', 'Toyota', 'Mahindra']
const modelOptions = ['Himalayan 450', 'CRF 250L', 'XPulse 200', 'Duke 250', 'FZ-S', 'Scorpio', 'Hilux', 'Land Cruiser']
const yearOptions = ['2026', '2025', '2024', '2023', '2022', '2021']
const subtitleOptions = ['High road support', 'Road and tour', 'Mountain trip', 'City and transfer']

function getSpecValue(specs, label) {
  if (!Array.isArray(specs)) return ''
  return specs.find((s) => String(s?.label || '').toLowerCase() === String(label).toLowerCase())?.value || ''
}

function splitName(name) {
  const raw = String(name || '').trim()
  if (!raw) return { make: '', model: '' }
  const [make, ...rest] = raw.split(/\s+/)
  return { make: make || '', model: rest.join(' ') }
}

export default function FleetPage() {
  // Full fleet list from Supabase.
  const [vehicles, setVehicles] = useState([])
  // Search query for filtering.
  const [query, setQuery] = useState('')
  // Loading/error state for fetch and actions.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  // Guard to disable row actions.
  const [busyId, setBusyId] = useState('')

  const [editVehicleId, setEditVehicleId] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editImageFile, setEditImageFile] = useState(null)
  const [editForm, setEditForm] = useState({
    make: '',
    model: '',
    year: '',
    subtitle: '',
    category: 'bike',
    engine: '',
    pricePerDay: '',
    notes: '',
    bluebookExpiry: '',
    insuranceExpiry: '',
    imageUrl: '',
    isAvailable: true,
  })

  // Fetch vehicles for admin view.
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
    // Initial data load.
    loadVehicles()
  }, [])

  // Filter vehicles by name or type.
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

  // Toggle availability for a single vehicle.
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

  // Delete a vehicle after confirmation.
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

  // Copy the selected vehicle into local edit state.
  const openEdit = (vehicle) => {
    const { make, model } = splitName(vehicle.name)
    setEditVehicleId(vehicle.id)
    setEditImageFile(null)
    setEditForm({
      make,
      model,
      year: getSpecValue(vehicle.technical_specs, 'Year'),
      subtitle: vehicle.subtitle || '',
      category: vehicle.category || vehicle.type || 'bike',
      engine: vehicle.engine || '',
      pricePerDay: String(vehicle.price_per_day ?? ''),
      notes: vehicle.notes || '',
      bluebookExpiry: getSpecValue(vehicle.technical_specs, 'Bluebook Expiry'),
      insuranceExpiry: getSpecValue(vehicle.technical_specs, 'Insurance Expiry'),
      imageUrl: vehicle.image || '',
      isAvailable: Boolean(vehicle.is_available),
    })
  }

  // Reset the inline edit form.
  const cancelEdit = () => {
    setEditVehicleId('')
    setEditImageFile(null)
    setEditForm({
      make: '',
      model: '',
      year: '',
      subtitle: '',
      category: 'bike',
      engine: '',
      pricePerDay: '',
      notes: '',
      bluebookExpiry: '',
      insuranceExpiry: '',
      imageUrl: '',
      isAvailable: true,
    })
  }

  // Persist inline edits.
  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editVehicleId) return

    const fleetName = `${editForm.make} ${editForm.model}`.trim()
    if (!fleetName) {
      setError('Vehicle make and model are required.')
      return
    }

    setIsSavingEdit(true)
    setError('')
    try {
      let imageUrl = editForm.imageUrl.trim()
      if (editImageFile) {
        imageUrl = await vehicleService.uploadImage(editImageFile, editForm.category)
      }

      await vehicleService.update(editVehicleId, {
        name: fleetName,
        subtitle: editForm.subtitle.trim() || `${editForm.category.toUpperCase()} Fleet`,
        type: editForm.category,
        category: editForm.category,
        engine: editForm.engine.trim() || null,
        price_per_day: Number(editForm.pricePerDay || 0),
        image: imageUrl || null,
        notes: editForm.notes.trim() || null,
        is_available: Boolean(editForm.isAvailable),
        technical_specs: [
          { label: 'Year', value: editForm.year || '-' },
          { label: 'Bluebook Expiry', value: editForm.bluebookExpiry || '-' },
          { label: 'Insurance Expiry', value: editForm.insuranceExpiry || '-' },
        ],
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
            <p className="text-xs text-txt-secondary mb-3">Edit vehicle (full form)</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Make</label>
                <input list="edit-vehicle-make-options" value={editForm.make} onChange={(e) => setEditForm((p) => ({ ...p, make: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Model</label>
                <input list="edit-vehicle-model-options" value={editForm.model} onChange={(e) => setEditForm((p) => ({ ...p, model: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Year</label>
                <input list="edit-vehicle-year-options" value={editForm.year} onChange={(e) => setEditForm((p) => ({ ...p, year: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Subtitle</label>
                <input list="edit-vehicle-subtitle-options" value={editForm.subtitle} onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            <datalist id="edit-vehicle-make-options">{makeOptions.map((opt) => <option key={opt} value={opt} />)}</datalist>
            <datalist id="edit-vehicle-model-options">{modelOptions.map((opt) => <option key={opt} value={opt} />)}</datalist>
            <datalist id="edit-vehicle-year-options">{yearOptions.map((opt) => <option key={opt} value={opt} />)}</datalist>
            <datalist id="edit-vehicle-subtitle-options">{subtitleOptions.map((opt) => <option key={opt} value={opt} />)}</datalist>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.title} - {cat.desc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Engine</label>
                <input value={editForm.engine} onChange={(e) => setEditForm((p) => ({ ...p, engine: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Daily Rental (NPR)</label>
                <input value={editForm.pricePerDay} onChange={(e) => setEditForm((p) => ({ ...p, pricePerDay: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div className="flex items-end gap-2">
                <input id="fleet-edit-available" type="checkbox" checked={editForm.isAvailable} onChange={(e) => setEditForm((p) => ({ ...p, isAvailable: e.target.checked }))} />
                <label htmlFor="fleet-edit-available" className="text-xs text-txt-secondary">Mark as available</label>
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Bluebook Expiry</label>
                <input type="date" value={editForm.bluebookExpiry} onChange={(e) => setEditForm((p) => ({ ...p, bluebookExpiry: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Insurance Expiry</label>
                <input type="date" value={editForm.insuranceExpiry} onChange={(e) => setEditForm((p) => ({ ...p, insuranceExpiry: e.target.value }))} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Image</label>
              <label className="w-full min-h-24 border-2 border-dashed border-dark-border rounded-xl flex items-center justify-center cursor-pointer hover:border-brand-orange transition-colors px-4 py-4">
                <div className="flex items-center gap-2 text-xs text-txt-secondary">
                  <Upload className="w-4 h-4" />
                  {editImageFile ? editImageFile.name : 'Click to upload new image'}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)} />
              </label>
              <input
                type="text"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="Or paste image URL"
                className="w-full mt-2 bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-txt-secondary mb-1.5 block">Notes</label>
              <textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm resize-none" />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm rounded-md border border-dark-border text-txt-secondary hover:text-txt-primary">
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
