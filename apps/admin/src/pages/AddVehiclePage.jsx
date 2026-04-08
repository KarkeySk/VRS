import { useMemo, useState } from 'react'
import { FileText, Image, Palette, Settings, Upload } from 'lucide-react'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'

const categories = [
  { id: 'bike', title: 'Motorbike', desc: 'Off-road and touring' },
  { id: 'suv', title: 'SUV', desc: 'High-altitude support' },
  { id: 'jeep', title: 'Jeep', desc: 'Mountain expedition' },
  { id: 'pickup', title: 'Pickup', desc: 'Cargo and logistics' },
  { id: 'car', title: 'Car', desc: 'City and transfer' },
]

const initialForm = {
  make: '',
  model: '',
  year: '',
  subtitle: '',
  engine: '',
  pricePerDay: '',
  notes: '',
  bluebookExpiry: '',
  insuranceExpiry: '',
}

export default function AddVehiclePage({ onNavigate }) {
  const [form, setForm] = useState(initialForm)
  const [selectedCategory, setSelectedCategory] = useState('bike')
  const [imageFile, setImageFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fleetName = useMemo(() => {
    return `${form.make} ${form.model}`.trim()
  }, [form.make, form.model])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fleetName) {
      setError('Vehicle make and model are required')
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await vehicleService.uploadImage(imageFile, selectedCategory)
      }

      await vehicleService.create({
        name: fleetName,
        subtitle: form.subtitle || `${selectedCategory.toUpperCase()} Fleet`,
        type: selectedCategory,
        engine: form.engine || null,
        price_per_day: Number(form.pricePerDay || 0),
        image: imageUrl || null,
        category: selectedCategory,
        is_available: true,
        technical_specs: [
          { label: 'Year', value: form.year || '-' },
          { label: 'Bluebook Expiry', value: form.bluebookExpiry || '-' },
          { label: 'Insurance Expiry', value: form.insuranceExpiry || '-' },
        ],
        capabilities: [],
        addons: [],
      })

      setSuccess('Vehicle created successfully')
      setForm(initialForm)
      setImageFile(null)
      setTimeout(() => onNavigate('fleet'), 500)
    } catch (err) {
      setError(err.message || 'Failed to create vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Vehicle Registration</h2>
        <span className="text-sm text-txt-secondary">Connected to Supabase</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-orange" /> Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Make</label>
                <input value={form.make} onChange={(e) => handleChange('make', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Model</label>
                <input value={form.model} onChange={(e) => handleChange('model', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Year</label>
                <input value={form.year} onChange={(e) => handleChange('year', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Subtitle</label>
                <input value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-brand-orange" /> Vehicle Image
            </h3>
            <label className="w-full min-h-36 border-2 border-dashed border-dark-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange transition-colors">
              <Upload className="w-7 h-7 text-txt-muted" />
              <p className="text-xs text-txt-secondary mt-2">{imageFile ? imageFile.name : 'Click to upload image'}</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-orange" /> Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${active ? 'border-brand-orange bg-brand-orange/10' : 'border-dark-border hover:border-brand-orange/50'}`}
                  >
                    <p className={`text-sm font-semibold ${active ? 'text-brand-orange' : 'text-txt-primary'}`}>{cat.title}</p>
                    <p className="text-[11px] text-txt-secondary">{cat.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-orange" /> Additional Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Engine</label>
                <input value={form.engine} onChange={(e) => handleChange('engine', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Daily Rental (NPR)</label>
                <input value={form.pricePerDay} onChange={(e) => handleChange('pricePerDay', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Bluebook Expiry</label>
                <input type="date" value={form.bluebookExpiry} onChange={(e) => handleChange('bluebookExpiry', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Insurance Expiry</label>
                <input type="date" value={form.insuranceExpiry} onChange={(e) => handleChange('insuranceExpiry', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-txt-secondary mb-1.5 block">Notes</label>
              <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none resize-none" />
            </div>
          </div>

          {error && <div className="rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">{error}</div>}
          {success && <div className="rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-xs text-status-green">{success}</div>}

          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={() => onNavigate('fleet')} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-action px-8 py-2.5 text-sm disabled:opacity-60">
              {isSubmitting ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Live Preview</h4>
            <p className="text-xs text-txt-secondary">Name</p>
            <p className="text-base font-semibold mb-2">{fleetName || 'No vehicle name yet'}</p>
            <p className="text-xs text-txt-secondary">Category</p>
            <p className="text-sm uppercase mb-2">{selectedCategory}</p>
            <p className="text-xs text-txt-secondary">Price/Day</p>
            <p className="text-sm">NPR {Number(form.pricePerDay || 0).toLocaleString()}</p>
          </div>
        </div>
      </form>
    </div>
  )
}
