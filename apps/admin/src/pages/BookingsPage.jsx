import { CalendarDays } from "lucide-react";

export default function BookingsPage({ onNavigate }) {
  return (
    <div>
      <p className="text-sm text-txt-secondary mb-4">
        This page shares the Dashboard booking view. Select{" "}
        <strong className="text-brand-orange">Dashboard</strong> to manage bookings.
      </p>
      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-8 text-center">
        <CalendarDays className="w-16 h-16 mx-auto mb-4 text-txt-muted" />
        <h3 className="text-xl font-bold mb-2">Bookings Calendar</h3>
        <p className="text-txt-secondary text-sm mb-4">
          View and manage all upcoming and past expedition bookings from the dashboard.
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="btn-action px-6 py-2.5 text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'

const statusOptions = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled']

export default function BookingsPage({ onNavigate }) {
  const [bookings, setBookings] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadBookings = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await bookingService.getAll()
      setBookings(data ?? [])
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings.filter((b) => {
      const customer = `${b.profiles?.full_name ?? ''}`.toLowerCase()
      const vehicle = `${b.vehicles?.name ?? ''}`.toLowerCase()
      const statusOk = status === 'all' || b.status === status
      const queryOk = !q || customer.includes(q) || vehicle.includes(q) || b.id.toLowerCase().includes(q)
      return statusOk && queryOk
    })
  }, [bookings, query, status])

  const setBookingStatus = async (bookingId, nextStatus) => {
    setBusyId(bookingId)
    try {
      await bookingService.update(bookingId, { status: nextStatus })
      await loadBookings()
    } catch (err) {
      setError(err.message || 'Failed to update booking status')
    } finally {
      setBusyId('')
    }
  }

  const handleDelete = async (bookingId) => {
    const ok = window.confirm('Delete this booking permanently?')
    if (!ok) return
    setBusyId(bookingId)
    try {
      await bookingService.delete(bookingId)
      await loadBookings()
    } catch (err) {
      setError(err.message || 'Failed to delete booking')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-xs text-txt-secondary">Manage all bookings here.</p>
        </div>
        <button onClick={() => onNavigate('new-booking')} className="btn-action px-5 py-2 text-sm">
          + New Booking
        </button>
      </div>

      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search booking id, customer, or vehicle"
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
              {filtered.map((b, idx) => (
                <tr key={b.id} className={idx < filtered.length - 1 ? 'border-b border-dark-border/50' : ''}>
                  <td className="py-3 text-xs text-txt-secondary">#{b.id.slice(0, 8)}</td>
                  <td>
                    <p className="text-sm font-semibold">{b.profiles?.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-txt-secondary">{b.profiles?.phone || 'No phone'}</p>
                  </td>
                  <td className="text-sm">{b.vehicles?.name || 'Unknown Vehicle'}</td>
                  <td className="text-xs text-txt-secondary">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {b.start_date} to {b.end_date}
                    </div>
                  </td>
                  <td>NPR {Number(b.total_price || 0).toLocaleString()}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded bg-brand-orange/20 text-brand-orange uppercase">
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setBookingStatus(b.id, b.status === 'confirmed' ? 'active' : 'confirmed')}
                        className="px-2 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {b.status === 'confirmed' ? 'Activate' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setBookingStatus(b.id, 'cancelled')}
                        className="px-2 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => handleDelete(b.id)}
                        className="px-2 py-1 text-xs rounded border border-status-red/30 text-status-red hover:bg-status-red/10 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
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
