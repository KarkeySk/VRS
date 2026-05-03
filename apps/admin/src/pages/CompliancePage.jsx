import { useEffect, useMemo, useState } from 'react'
import { FileText, Filter, ExternalLink, CreditCard, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { applicationService } from '@bhatbhati/shared/services/applicationService.js'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'
import {
  getBookingEmailDetails,
  sendApprovalEmailOnce,
  shouldSendApprovalEmail,
} from '@bhatbhati/shared/services/emailService.js'

// Badge styles per compliance status.
const statusStyles = {
  submitted: 'bg-status-yellow/20 text-status-yellow',
  'under-review': 'bg-brand-orange/20 text-brand-orange',
  approved: 'bg-status-green/20 text-status-green',
  rejected: 'bg-status-red/20 text-status-red',
  confirmed: 'bg-[rgba(100,150,200,0.2)] text-[#64d4ff]',
  cancelled: 'bg-dark-border text-txt-secondary',
}

const paymentStatusStyles = {
  completed: 'bg-status-green/20 text-status-green',
  pending: 'bg-status-yellow/20 text-status-yellow',
  failed: 'bg-status-red/20 text-status-red',
}

export default function CompliancePage() {
  // Tab state: 'checks' or 'payments'
  const [activeTab, setActiveTab] = useState('checks')
  // Raw application data.
  const [applications, setApplications] = useState([])
  // Active filter for the table.
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  // UI state for loading and errors.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  // Load all compliance applications.
  const loadApplications = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await applicationService.getAll()
      setApplications(data ?? [])
    } catch (err) {
      setError(err.message || 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  // Filter list based on the selected status.
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return applications
    return applications.filter((app) => app.status === statusFilter)
  }, [applications, statusFilter])

  // Payment-filtered applications
  const paymentFiltered = useMemo(() => {
    const withPayment = applications.filter((app) => app.payment_status)
    if (paymentFilter === 'all') return withPayment
    return withPayment.filter((app) => app.payment_status === paymentFilter)
  }, [applications, paymentFilter])

  // Payment stats
  const paymentStats = useMemo(() => {
    const all = applications.filter((app) => app.total_price)
    const completed = all.filter((app) => app.payment_status === 'completed')
    const pending = all.filter((app) => app.payment_status === 'pending' && app.status === 'approved')
    const failed = all.filter((app) => app.payment_status === 'failed')
    const totalRevenue = completed.reduce((sum, app) => sum + Number(app.total_price || 0), 0)
    const pendingRevenue = pending.reduce((sum, app) => sum + Number(app.total_price || 0), 0)
    return { completed: completed.length, pending: pending.length, failed: failed.length, totalRevenue, pendingRevenue }
  }, [applications])

  // Pending count shown in the header.
  const pendingCount = applications.filter((app) => ['submitted', 'under-review'].includes(app.status)).length

  // Update status and optionally create a booking.
  const updateStatus = async (id, status) => {
    setBusyId(id)
    try {
      let approvalEmailBooking = null
      let currentStatus = ''

      // On approval, create a booking if one does not exist yet.
      if (status === 'approved') {
        const target = applications.find((app) => app.id === id)
        if (target) {
          currentStatus = target.status
          const existing = await bookingService.findMatchingTrip({
            userId: target.user_id,
            vehicleId: target.vehicle_id,
            startDate: target.start_date,
            endDate: target.end_date,
          })

          approvalEmailBooking = existing

          if (approvalEmailBooking) {
            if (approvalEmailBooking.status !== 'confirmed') {
              await bookingService.update(approvalEmailBooking.id, { status: 'confirmed' })
            }
            approvalEmailBooking = await getBookingEmailDetails(approvalEmailBooking.id)
          } else {
            const createdBooking = await bookingService.create({
              user_id: target.user_id,
              vehicle_id: target.vehicle_id,
              start_date: target.start_date,
              end_date: target.end_date,
              total_price: target.total_price || 0,
              status: 'confirmed',
              addons: target.selected_addons || [],
              notes: JSON.stringify({
                source: 'application',
                application_id: target.id,
                drive_type: target.drive_type,
              }),
            })
            approvalEmailBooking = await getBookingEmailDetails(createdBooking.id)
          }
        }
      }

      const updatedApplication = await applicationService.updateStatus(id, status)

      const shouldEmail = shouldSendApprovalEmail({
        currentStatus,
        nextStatus: updatedApplication.status,
        booking: approvalEmailBooking,
      })

      let emailWarning = ''
      if (shouldEmail) {
        try {
          await sendApprovalEmailOnce(approvalEmailBooking)
        } catch (err) {
          emailWarning = err.message || 'Confirmation email was not sent'
        }
      }
      await loadApplications()
      if (emailWarning) {
        setError(`Request approved, but confirmation email was not sent: ${emailWarning}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setBusyId('')
    }
  }

  // Open signed document URLs in a new tab.
  const openDocument = async (path) => {
    if (!path) return
    try {
      const signed = await applicationService.getDocumentUrl(path)
      if (signed) window.open(signed, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.message || 'Failed to open document')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Checks & Logs</h2>
          <p className="text-xs text-txt-secondary">Waiting: {pendingCount} requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('checks')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'checks'
              ? 'bg-brand-orange text-dark'
              : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          Application Checks
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'payments'
              ? 'bg-brand-orange text-dark'
              : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          Payment Tracking
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
          {error}
        </div>
      )}

      {/* CHECKS TAB */}
      {activeTab === 'checks' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-txt-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark border border-dark-border rounded-md px-2.5 py-1.5 text-xs text-txt-primary"
            >
              <option value="all">All status</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            {isLoading ? (
              <p className="text-sm text-txt-secondary">Loading requests...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
                    <th className="pb-3">Request</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Documents</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => (
                    <tr key={app.id} className={i < filtered.length - 1 ? 'border-b border-dark-border/50' : ''}>
                      <td className="py-3 text-xs text-txt-secondary">#{app.id.slice(0, 8)}</td>
                      <td>
                        <p className="text-sm font-semibold">{app.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-txt-secondary">{app.drive_type}</p>
                      </td>
                      <td className="text-sm">{app.vehicles?.name || 'Unknown Vehicle'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDocument(app.id_doc_url)}
                            disabled={!app.id_doc_url}
                            className="px-2 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            ID
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDocument(app.license_doc_url)}
                            disabled={!app.license_doc_url}
                            className="px-2 py-1 text-xs rounded border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            License
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${statusStyles[app.status] || 'bg-dark-border text-txt-secondary'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(app.id, 'approved')}
                            disabled={busyId === app.id}
                            className="px-2.5 py-1 text-xs rounded bg-status-green/20 text-status-green hover:bg-status-green/30 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(app.id, 'rejected')}
                            disabled={busyId === app.id}
                            className="px-2.5 py-1 text-xs rounded bg-status-red/20 text-status-red hover:bg-status-red/30 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <>
          {/* Revenue Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-status-green/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-status-green" />
                </div>
                <span className="text-xs text-txt-secondary uppercase tracking-wider font-semibold">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold m-0">NPR {paymentStats.totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-txt-secondary mt-1 m-0">{paymentStats.completed} completed payment{paymentStats.completed !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-status-yellow/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-status-yellow" />
                </div>
                <span className="text-xs text-txt-secondary uppercase tracking-wider font-semibold">Pending</span>
              </div>
              <p className="text-2xl font-bold m-0">NPR {paymentStats.pendingRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-txt-secondary mt-1 m-0">{paymentStats.pending} awaiting payment</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-orange/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-brand-orange" />
                </div>
                <span className="text-xs text-txt-secondary uppercase tracking-wider font-semibold">eSewa Payments</span>
              </div>
              <p className="text-2xl font-bold m-0">{paymentStats.completed}</p>
              <p className="text-[11px] text-txt-secondary mt-1 m-0">via eSewa gateway</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-status-red/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-status-red" />
                </div>
                <span className="text-xs text-txt-secondary uppercase tracking-wider font-semibold">Failed</span>
              </div>
              <p className="text-2xl font-bold m-0">{paymentStats.failed}</p>
              <p className="text-[11px] text-txt-secondary mt-1 m-0">failed transaction{paymentStats.failed !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-txt-secondary" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-dark border border-dark-border rounded-md px-2.5 py-1.5 text-xs text-txt-primary"
            >
              <option value="all">All payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Payment Table */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            {isLoading ? (
              <p className="text-sm text-txt-secondary">Loading payment data...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
                    <th className="pb-3">Application</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Payment Status</th>
                    <th className="pb-3">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentFiltered.map((app, i) => (
                    <tr key={app.id} className={i < paymentFiltered.length - 1 ? 'border-b border-dark-border/50' : ''}>
                      <td className="py-3 text-xs text-txt-secondary">#{app.id.slice(0, 8)}</td>
                      <td>
                        <p className="text-sm font-semibold">{app.profiles?.full_name || 'Unknown'}</p>
                      </td>
                      <td className="text-sm">{app.vehicles?.name || 'Unknown'}</td>
                      <td className="text-sm font-semibold text-brand-orange">
                        NPR {Number(app.total_price || 0).toLocaleString()}
                      </td>
                      <td>
                        {app.payment_method ? (
                          <span className="px-2 py-1 text-[10px] rounded font-semibold bg-status-green/10 text-status-green uppercase">
                            {app.payment_method}
                          </span>
                        ) : (
                          <span className="text-xs text-txt-muted">--</span>
                        )}
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${paymentStatusStyles[app.payment_status] || 'bg-dark-border text-txt-secondary'}`}>
                          {app.payment_status || 'none'}
                        </span>
                      </td>
                      <td className="text-[11px] text-txt-muted font-mono">
                        {app.esewa_transaction_uuid
                          ? app.esewa_transaction_uuid.slice(0, 16) + '...'
                          : '--'}
                      </td>
                    </tr>
                  ))}
                  {paymentFiltered.length === 0 && (
                    <tr>
                      <td className="pt-4 text-sm text-txt-secondary" colSpan={7}>No payment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
