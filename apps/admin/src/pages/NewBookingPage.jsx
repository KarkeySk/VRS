import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  User,
  MapPin,
  Shield,
  CreditCard,
  Bike,
  ChevronDown,
  Navigation,
  Thermometer,
  Loader2,
} from 'lucide-react'
import { authService } from '@bhatbhati/shared/services/authService.js'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'

const routeOptions = [
  { id: 'annapurna', name: 'Annapurna Circuit', duration: '12-16 days', difficulty: 'Moderate' },
  { id: 'mustang', name: 'Upper Mustang', duration: '8-10 days', difficulty: 'Challenging' },
  { id: 'manang', name: 'Manang Valley', duration: '5-7 days', difficulty: 'Easy' },
  { id: 'everest', name: 'Everest Base Camp Route', duration: '14-18 days', difficulty: 'Hard' },
  { id: 'custom', name: 'Custom Route', duration: 'Flexible', difficulty: 'Varies' },
]

const extraAddons = [
  { id: 'offroad', label: 'Off-Road Pack', price: 3500, icon: Bike },
  { id: 'helmet', label: 'Extra Helmet', price: 500, icon: Shield },
  { id: 'gps', label: 'GPS Navigation', price: 1200, icon: Navigation },
  { id: 'insurance', label: 'Full Insurance', price: 4000, icon: Shield },
  { id: 'camping', label: 'Camping Gear', price: 5500, icon: Thermometer },
  { id: 'luggage', label: 'Premium Luggage', price: 2000, icon: Thermometer },
]

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  nationality: '',
  licenseNumber: '',
  preferredGuide: '',
  pickupDate: '',
  returnDate: '',
  pickupLocation: '',
  dropoffLocation: '',
  paymentMethod: 'cash',
  depositAmount: '',
  notes: '',
}

function getDays(start, end) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
}

export default function NewBookingPage({ onNavigate }) {
  const [bookingType, setBookingType] = useState('self-drive')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [currentUser, vehiclesData] = await Promise.all([
          authService.getUser(),
          vehicleService.getAll(),
        ])
        setUser(currentUser)
        setVehicles(vehiclesData ?? [])
      } catch (err) {
        setError(err.message || 'Failed to load booking form data')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const selectedVehicleDetails = useMemo(() => vehicles.find((v) => v.id === selectedVehicle), [vehicles, selectedVehicle])
  const route = useMemo(() => routeOptions.find((r) => r.id === selectedRoute), [selectedRoute])

  const days = useMemo(() => getDays(form.pickupDate, form.returnDate), [form.pickupDate, form.returnDate])
  const addonTotal = useMemo(
    () => selectedAddons.reduce((sum, addonId) => sum + (extraAddons.find((a) => a.id === addonId)?.price || 0), 0),
    [selectedAddons],
  )
  const rentalTotal = useMemo(() => Number(selectedVehicleDetails?.price_per_day || 0) * days, [selectedVehicleDetails?.price_per_day, days])
  const total = rentalTotal + addonTotal

  const toggleAddon = (id) => {
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user?.id) {
      setError('Login session missing. Please sign in again.')
      return
    }

    if (!selectedVehicle) {
      setError('Please select a vehicle.')
      return
    }

    if (!form.pickupDate || !form.returnDate || days <= 0) {
      setError('Please choose a valid pickup and return date.')
      return
    }

    if (!selectedRoute) {
      setError('Please select an expedition route.')
      return
    }

    setIsSubmitting(true)
    try {
      await bookingService.create({
        user_id: user.id,
        vehicle_id: selectedVehicle,
        start_date: form.pickupDate,
        end_date: form.returnDate,
        total_price: total,
        status: 'confirmed',
        addons: selectedAddons,
        notes: JSON.stringify({
          bookingType,
          route: route?.name || selectedRoute,
          customer: {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            nationality: form.nationality,
          },
          pickupLocation: form.pickupLocation,
          dropoffLocation: form.dropoffLocation,
          paymentMethod: form.paymentMethod,
          depositAmount: form.depositAmount,
          licenseNumber: form.licenseNumber,
          preferredGuide: form.preferredGuide,
          notes: form.notes,
        }),
      })

      setSuccess('Booking created successfully.')
      setForm(initialForm)
      setSelectedAddons([])
      setSelectedRoute('')
      setSelectedVehicle('')
      setTimeout(() => onNavigate('bookings'), 500)
    } catch (err) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">New Booking</h2>
        <span className="text-sm text-txt-secondary">Expedition Reservation</span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-status-green/30 bg-status-green/10 px-3 py-2 text-xs text-status-green">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-txt-secondary flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading form data...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_280px] gap-6">
          <div className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-orange" /> Booking Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingType('self-drive')}
                  className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all ${
                    bookingType === 'self-drive'
                      ? 'border-brand-orange bg-brand-orange/10'
                      : 'border-dark-border bg-transparent hover:border-brand-orange/50'
                  }`}
                >
                  <Bike className={`w-8 h-8 mx-auto mb-2 ${bookingType === 'self-drive' ? 'text-brand-orange' : 'text-txt-secondary'}`} />
                  <p className={`text-sm font-semibold ${bookingType === 'self-drive' ? 'text-brand-orange' : 'text-txt-secondary'}`}>Self-Drive</p>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('with-driver')}
                  className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all ${
                    bookingType === 'with-driver'
                      ? 'border-brand-orange bg-brand-orange/10'
                      : 'border-dark-border bg-transparent hover:border-brand-orange/50'
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${bookingType === 'with-driver' ? 'text-brand-orange' : 'text-txt-secondary'}`} />
                  <p className={`text-sm font-semibold ${bookingType === 'with-driver' ? 'text-brand-orange' : 'text-txt-secondary'}`}>With Driver</p>
                </button>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange" /> Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Full Name', placeholder: 'e.g. Rajesh Hamal', type: 'text' },
                  { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +977 9841xxxxxx', type: 'tel' },
                  { key: 'email', label: 'Email Address', placeholder: 'e.g. customer@email.com', type: 'email' },
                  { key: 'nationality', label: 'Nationality', placeholder: 'e.g. Nepali', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-txt-secondary mb-1.5 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                ))}
              </div>
              {bookingType === 'self-drive' && (
                <div className="mt-4">
                  <label className="text-xs text-txt-secondary mb-1.5 block">License Number</label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    placeholder="e.g. DL-2024-KTM-XXXXX"
                    className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              )}
              {bookingType === 'with-driver' && (
                <div className="mt-4">
                  <label className="text-xs text-txt-secondary mb-1.5 block">Preferred Guide / Driver</label>
                  <div className="relative">
                    <select
                      value={form.preferredGuide}
                      onChange={(e) => handleChange('preferredGuide', e.target.value)}
                      className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm appearance-none"
                    >
                      <option value="">Select a guide (optional)</option>
                      <option value="Karma Sherpa">Karma Sherpa - Annapurna Specialist</option>
                      <option value="Raj Thapa">Raj Thapa - Mustang Expert</option>
                      <option value="Tenzing Lama">Tenzing Lama - High-Altitude Pro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-orange" /> Vehicle Selection
              </h3>
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all text-left ${
                      selectedVehicle === v.id
                        ? 'border-brand-orange bg-brand-orange/10'
                        : 'border-dark-border bg-dark-deeper hover:border-brand-orange/40'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${selectedVehicle === v.id ? 'text-brand-orange' : 'text-txt-primary'}`}>{v.name}</p>
                      <p className="text-xs text-txt-secondary">{v.subtitle || v.type || '-'}</p>
                    </div>
                    <span className={`text-xs font-bold ${selectedVehicle === v.id ? 'text-brand-orange' : 'text-txt-secondary'}`}>
                      NPR {Number(v.price_per_day || 0).toLocaleString()}/day
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-orange" /> Trip Details
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Pickup Date</label>
                  <input type="date" value={form.pickupDate} onChange={(e) => handleChange('pickupDate', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Return Date</label>
                  <input type="date" value={form.returnDate} onChange={(e) => handleChange('returnDate', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Pickup Location</label>
                  <input type="text" value={form.pickupLocation} onChange={(e) => handleChange('pickupLocation', e.target.value)} placeholder="e.g. Pokhara Lakeside Hub" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Drop-off Location</label>
                  <input type="text" value={form.dropoffLocation} onChange={(e) => handleChange('dropoffLocation', e.target.value)} placeholder="e.g. Kathmandu Thamel Office" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>

              <label className="text-xs text-txt-secondary mb-2 block">Expedition Route</label>
              <div className="grid grid-cols-2 gap-2">
                {routeOptions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoute(r.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedRoute === r.id
                        ? 'border-brand-orange bg-brand-orange/10'
                        : 'border-dark-border bg-dark-deeper hover:border-brand-orange/40'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 shrink-0 ${selectedRoute === r.id ? 'text-brand-orange' : 'text-txt-secondary'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${selectedRoute === r.id ? 'text-brand-orange' : 'text-txt-primary'}`}>{r.name}</p>
                      <p className="text-[10px] text-txt-muted">{r.duration} · {r.difficulty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-orange" /> Add-Ons & Extras
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {extraAddons.map((addon) => {
                  const Icon = addon.icon
                  const isSelected = selectedAddons.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`border-2 rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-orange bg-brand-orange/10'
                          : 'border-dark-border bg-transparent hover:border-brand-orange/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1.5 ${isSelected ? 'text-brand-orange' : 'text-txt-secondary'}`} />
                      <p className={`text-xs font-semibold ${isSelected ? 'text-brand-orange' : 'text-txt-primary'}`}>{addon.label}</p>
                      <p className="text-[10px] text-txt-muted mt-0.5">NPR {addon.price.toLocaleString()}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-orange" /> Payment & Notes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Payment Method</label>
                  <div className="relative">
                    <select value={form.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm appearance-none">
                      <option value="cash">Cash on Pickup</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Deposit Amount (NPR)</label>
                  <input type="number" value={form.depositAmount} onChange={(e) => handleChange('depositAmount', e.target.value)} placeholder="e.g. 10000" className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs text-txt-secondary mb-1.5 block">Special Requests / Notes</label>
                <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any special requirements for this expedition..." rows={3} className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => onNavigate('dashboard')} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer bg-transparent border-none">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-action px-8 py-2.5 text-sm disabled:opacity-60">
                {isSubmitting ? 'Creating...' : 'Confirm Booking'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h4 className="text-sm font-semibold mb-3">Booking Checklist</h4>
              <div className="space-y-2">
                {[
                  { step: 'Booking Type', done: true },
                  { step: 'Vehicle Selection', done: Boolean(selectedVehicle) },
                  { step: 'Trip Details', done: Boolean(days && selectedRoute) },
                  { step: 'Add-Ons', done: true },
                  { step: 'Payment & Notes', done: Boolean(form.paymentMethod) },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-center gap-2 text-xs">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.done ? 'bg-brand-orange text-dark' : 'border border-dark-border text-txt-secondary'}`}>
                      {item.done ? '✓' : i + 1}
                    </span>
                    <span className={item.done ? 'text-brand-orange' : 'text-txt-secondary'}>{item.step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <h4 className="text-sm font-semibold mb-3">Pricing Preview</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-txt-secondary">
                  <span>Rental ({days} day{days === 1 ? '' : 's'})</span>
                  <span>NPR {rentalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-txt-secondary">
                  <span>Add-Ons ({selectedAddons.length})</span>
                  <span>NPR {addonTotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-dark-border pt-2 flex justify-between font-bold text-sm">
                  <span>Estimated Total</span>
                  <span className="text-brand-orange">NPR {total.toLocaleString()}</span>
                </div>
                {route && (
                  <div className="text-[11px] text-txt-secondary border-t border-dark-border pt-2">
                    Route: {route.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
