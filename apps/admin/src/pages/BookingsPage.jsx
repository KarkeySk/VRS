import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'
import { applicationService } from '@bhatbhati/shared/services/applicationService.js'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'
import { authService } from '@bhatbhati/shared/services/authService.js'

const statusOptions = [
  'all',
  'submitted',
  'under-review',
  'approved',
  'rejected',
  'pending',
  'confirmed',
  'active',
  'completed',
  'cancelled',
]

function parseJson(value) {
  if (!value || typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function profileName(profile) {
  if (!profile) return ''
  if (profile.full_name) return profile.full_name
  const composed = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
  return composed
}

function shortId(id) {
  return typeof id === 'string' ? id.slice(0, 8) : ''
}

export default function BookingsPage({ onNavigate }) {
  const [rows, setRows] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [adminUserId, setAdminUserId] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [error, setError] = useState('')
  const [busyKey, setBusyKey] = useState('')
  const [quickForm, setQuickForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    totalPrice: '',
  })

  const loadRows = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [bookings, applications] = await Promise.all([
        bookingService.getAll(),
        applicationService.getAll(),
      ])

      const bookingRows = (bookings ?? []).map((b) => {
        const notes = parseJson(b.notes)
        const notesCustomer = notes?.customer || {}
        return {
          key: `booking:${b.id}`,
          kind: 'booking',
          id: b.id,
          createdAt: b.created_at,
          status: b.status,
          startDate: b.start_date,
          endDate: b.end_date,
          totalPrice: b.total_price,
          vehicleName: b.vehicles?.name || 'Unknown Vehicle',
          customerName: profileName(b.profiles) || notesCustomer.fullName || notesCustomer.name || 'Unknown User',
          customerPhone: b.profiles?.phone || notesCustomer.phone || '',
          customerEmail: b.profiles?.email || notesCustomer.email || '',
          raw: b,
        }
      })

      const applicationRows = (applications ?? []).map((app) => {
        const customer = app.questionnaire?.customer || {}
        return {
          key: `application:${app.id}`,
          kind: 'application',
          id: app.id,
          createdAt: app.created_at,
          status: app.status,
          startDate: app.start_date,
          endDate: app.end_date,
          totalPrice: app.total_price,
          vehicleName: app.vehicles?.name || 'Unknown Vehicle',
          customerName: profileName(app.profiles) || customer.name || 'Unknown User',
          customerPhone: app.profiles?.phone || customer.phone || '',
          customerEmail: app.profiles?.email || customer.email || '',
          raw: app,
        }
      })

      const merged = [...applicationRows, ...bookingRows].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRows(merged)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [user, vehiclesData] = await Promise.all([
          authService.getUser(),
          vehicleService.getAll(),
        ])
        setAdminUserId(user?.id || '')
        setVehicles(vehiclesData ?? [])
      } catch (err) {
        setError(err.message || 'Failed to load booking form data')
      }
    }
    loadMeta()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const statusOk = status === 'all' || row.status === status
      if (!statusOk) return false

      if (!q) return true
      return [
        row.id,
        row.customerName,
        row.customerPhone,
        row.customerEmail,
        row.vehicleName,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, query, status])

  const setBookingStatus = async (bookingId, nextStatus) => {
    const key = `booking:${bookingId}`
    setBusyKey(key)
    try {
      await bookingService.update(bookingId, { status: nextStatus })
      await loadRows()
    } catch (err) {
      setError(err.message || 'Failed to update booking status')
    } finally {
      setBusyKey('')
    }
  }

  const approveApplication = async (app) => {
    const key = `application:${app.id}`
    setBusyKey(key)
    try {
      const existing = await bookingService.findMatchingTrip({
        userId: app.user_id,
        vehicleId: app.vehicle_id,
        startDate: app.start_date,
        endDate: app.end_date,
      })

      if (!existing) {
        await bookingService.create({
          user_id: app.user_id,
          vehicle_id: app.vehicle_id,
          start_date: app.start_date,
          end_date: app.end_date,
          total_price: app.total_price || 0,
          status: 'confirmed',
          addons: app.selected_addons || [],
          notes: JSON.stringify({
            source: 'application',
            application_id: app.id,
            drive_type: app.drive_type,
            customer: app.questionnaire?.customer || null,
            emergency_contact: app.questionnaire?.emergency_contact || null,
          }),
        })
      }

      await applicationService.updateStatus(app.id, 'approved')
      await loadRows()
    } catch (err) {
      setError(err.message || 'Failed to approve request')
    } finally {
      setBusyKey('')
    }
  }

  const setApplicationStatus = async (applicationId, nextStatus) => {
    const key = `application:${applicationId}`
    setBusyKey(key)
    try {
      await applicationService.updateStatus(applicationId, nextStatus)
      await loadRows()
    } catch (err) {
      setError(err.message || 'Failed to update request status')
    } finally {
      setBusyKey('')
    }
  }

  const handleDelete = async (bookingId) => {
    const ok = window.confirm('Delete this booking permanently?')
    if (!ok) return

    const key = `booking:${bookingId}`
    setBusyKey(key)
    try {
      await bookingService.delete(bookingId)
      await loadRows()
    } catch (err) {
      setError(err.message || 'Failed to delete booking')
    } finally {
      setBusyKey('')
    }
  }

  const createQuickBooking = async (e) => {
    e.preventDefault()
    setError('')

    if (!adminUserId) {
      setError('Admin login session missing. Please sign in again.')
      return
    }
    if (!quickForm.customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    if (!quickForm.vehicleId) {
      setError('Please select a vehicle.')
      return
    }
    if (!quickForm.startDate || !quickForm.endDate) {
      setError('Please provide start and end dates.')
      return
    }

    setIsCreating(true)
    try {
      await bookingService.create({
        user_id: adminUserId,
        vehicle_id: quickForm.vehicleId,
        start_date: quickForm.startDate,
        end_date: quickForm.endDate,
        total_price: Number(quickForm.totalPrice || 0),
        status: 'confirmed',
        addons: [],
        notes: JSON.stringify({
          source: 'admin-quick-form',
          customer: {
            fullName: quickForm.customerName.trim(),
            phone: quickForm.customerPhone.trim(),
            email: quickForm.customerEmail.trim().toLowerCase(),
          },
        }),
      })

      setQuickForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        totalPrice: '',
      })
      setShowQuickForm(false)
      await loadRows()
    } catch (err) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-xs text-txt-secondary">Manage requests and confirmed bookings here.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuickForm((v) => !v)}
            className="px-4 py-2 text-sm rounded-md border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange"
          >
            {showQuickForm ? 'Hide Quick Form' : 'Quick Add'}
          </button>
          <button onClick={() => onNavigate('new-booking')} className="btn-action px-5 py-2 text-sm">
            + New Booking
          </button>
        </div>
      </div>

      {showQuickForm && (
        <form onSubmit={createQuickBooking} className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 mb-5">
          <p className="text-xs text-txt-secondary mb-3">Quick booking form</p>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              value={quickForm.customerName}
              onChange={(e) => setQuickForm((p) => ({ ...p, customerName: e.target.value }))}
              placeholder="Customer name"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="tel"
              value={quickForm.customerPhone}
              onChange={(e) => setQuickForm((p) => ({ ...p, customerPhone: e.target.value }))}
              placeholder="Phone"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={quickForm.customerEmail}
              onChange={(e) => setQuickForm((p) => ({ ...p, customerEmail: e.target.value }))}
              placeholder="Email"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <select
              value={quickForm.vehicleId}
              onChange={(e) => setQuickForm((p) => ({ ...p, vehicleId: e.target.value }))}
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <input
              type="date"
              value={quickForm.startDate}
              onChange={(e) => setQuickForm((p) => ({ ...p, startDate: e.target.value }))}
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="date"
              value={quickForm.endDate}
              onChange={(e) => setQuickForm((p) => ({ ...p, endDate: e.target.value }))}
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              value={quickForm.totalPrice}
              onChange={(e) => setQuickForm((p) => ({ ...p, totalPrice: e.target.value }))}
              placeholder="Total price (NPR)"
              className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="btn-action px-4 py-2 text-sm disabled:opacity-60"
            >
              {isCreating ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, customer, phone, email, or vehicle"
              className="w-full bg-dark-deeper border border-dark-border rounded-md pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-dark-deeper border border-dark-border rounded-md px-3 py-2 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
          {error}
        </div>
      )}

      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
        {isLoading ? (
          <p className="text-sm text-txt-secondary">Loading bookings...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
                <th className="pb-3">Booking</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Dates</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.key} className={idx < filtered.length - 1 ? 'border-b border-dark-border/50' : ''}>
                  <td className="py-3 text-xs text-txt-secondary">
                    #{shortId(row.id)}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${row.kind === 'application' ? 'bg-status-yellow/20 text-status-yellow' : 'bg-brand-orange/20 text-brand-orange'}`}>
                      {row.kind === 'application' ? 'REQUEST' : 'BOOKING'}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm font-semibold">{row.customerName || 'Unknown User'}</p>
                    <p className="text-xs text-txt-secondary">
                      {[row.customerPhone, row.customerEmail].filter(Boolean).join(' • ') || 'No contact info'}
                    </p>
                  </td>
                  <td className="text-sm">{row.vehicleName}</td>
                  <td className="text-xs text-txt-secondary">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {row.startDate} to {row.endDate}
                    </div>
                  </td>
                  <td>NPR {Number(row.totalPrice || 0).toLocaleString()}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded bg-brand-orange/20 text-brand-orange uppercase">
                      {row.status}
                    </span>
                  </td>
                  <td>
                    {row.kind === 'booking' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyKey === row.key}
                          onClick={() => setBookingStatus(row.id, row.status === 'confirmed' ? 'active' : 'confirmed')}
                          className="px-2 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {row.status === 'confirmed' ? 'Activate' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === row.key}
                          onClick={() => setBookingStatus(row.id, 'cancelled')}
                          className="px-2 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === row.key}
                          onClick={() => handleDelete(row.id)}
                          className="px-2 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyKey === row.key}
                          onClick={() => approveApplication(row.raw)}
                          className="px-2 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === row.key}
                          onClick={() => setApplicationStatus(row.id, 'rejected')}
                          className="px-2 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="pt-4 text-sm text-txt-secondary" colSpan={7}>No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
