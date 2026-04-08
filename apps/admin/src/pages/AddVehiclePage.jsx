import { useState } from "react";
import { FileText, Image, Palette, Settings, Plus, Zap, Truck, Sparkles } from "lucide-react";

const categories = [
  { id: "mtf", title: "MTF Comp", desc: "Off-road & Trail", icon: Zap },
  { id: "commuter", title: "Commuter Motorcycle", desc: "City & Touring", icon: Truck },
  { id: "luxury", title: "Luxury Motorcycle", desc: "Premium & Adventure", icon: Sparkles },
];

export default function AddVehiclePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("mtf");
import { useMemo, useState } from 'react'
import { FileText, Image, Palette, Settings, Upload } from 'lucide-react'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'

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
        <span className="text-sm text-txt-secondary">Onboarding Portal</span>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left: Main Form */}
        <div className="space-y-6">
          {/* Vehicle Information */}
        <h2 className="text-2xl font-bold">Add Vehicle</h2>
        <span className="text-sm text-txt-secondary">Connected to Supabase</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-orange" /> Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Vehicle Make", placeholder: "e.g. Royal Enfield" },
                { label: "Model", placeholder: "e.g. Himalayan 450" },
                { label: "Year of Manufacture", placeholder: "e.g. 2024" },
                { label: "Plate Number", placeholder: "e.g. BA-2-CHA-4482" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs text-txt-secondary mb-1.5 block">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-brand-orange" /> Vehicle Photos
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {["Front", "Left Side", "Right Side", "Rear"].map((label) => (
                <div
                  key={label}
                  className="aspect-square bg-dark-deeper border-2 border-dashed border-dark-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange transition-colors group"
                >
                  <Plus className="w-6 h-6 text-txt-muted group-hover:text-brand-orange transition-colors" />
                  <span className="text-[10px] text-txt-muted mt-1 group-hover:text-brand-orange">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-orange" /> Motorcycle Category
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`border-2 rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "border-dark-border text-txt-secondary hover:border-brand-orange/50 bg-transparent"
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs font-semibold">{cat.title}</p>
                    <p className="text-[10px] opacity-70">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Make</label>
                <input list="vehicle-make-options" value={form.make} onChange={(e) => handleChange('make', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Model</label>
                <input list="vehicle-model-options" value={form.model} onChange={(e) => handleChange('model', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Year</label>
                <input list="vehicle-year-options" value={form.year} onChange={(e) => handleChange('year', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Subtitle</label>
                <input list="vehicle-subtitle-options" value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none" />
              </div>
            </div>
            <datalist id="vehicle-make-options">
              {makeOptions.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
            <datalist id="vehicle-model-options">
              {modelOptions.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
            <datalist id="vehicle-year-options">
              {yearOptions.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
            <datalist id="vehicle-subtitle-options">
              {subtitleOptions.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
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
            <label className="text-xs text-txt-secondary mb-1.5 block">Vehicle Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title} - {cat.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-orange" /> Additional Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Engine CC</label>
                <input type="text" placeholder="e.g. 450" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Bluebook Expiry</label>
                <input type="date" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Insurance Expiry</label>
                <input type="date" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Daily Rental Rate (NPR)</label>
                <input type="text" placeholder="e.g. 8,500" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-txt-secondary mb-1.5 block">Notes / Special Equipment</label>
              <textarea
                placeholder="Any additional notes about this vehicle..."
                rows={3}
                className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => onNavigate("fleet")}
              className="text-sm text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Cancel
            </button>
            <button className="btn-action px-8 py-2.5 text-sm">Register Vehicle</button>
          </div>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Registration Checklist</h4>
            <div className="space-y-2">
              {["Vehicle Information", "Photo Upload", "Category Selection", "Additional Details"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-xs text-txt-secondary">
                  <span className="w-4 h-4 rounded-full border border-dark-border flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-2">Current Fleet</h4>
            <p className="text-3xl font-bold text-brand-orange mb-1">124</p>
            <p className="text-xs text-txt-secondary">Total registered vehicles</p>
            <div className="w-full h-2 bg-dark-deeper rounded-full overflow-hidden mt-3">
              <div className="h-full bg-brand-orange rounded-full" style={{ width: "72%" }} />
            </div>
            <p className="text-[10px] text-txt-secondary mt-1">72% capacity utilization</p>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-2">Quick Tips</h4>
            <ul className="text-xs text-txt-secondary space-y-2 m-0 pl-4">
              <li>Upload clear photos for faster approval</li>
              <li>Ensure bluebook is valid for 6+ months</li>
              <li>Include all special equipment in notes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
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
              {isSubmitting ? 'Saving...' : 'Add Vehicle'}
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
