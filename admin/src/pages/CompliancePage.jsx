import { useEffect, useMemo, useState } from 'react'
import { FileText, Filter, ExternalLink, CreditCard, DollarSign, Clock, AlertTriangle, BarChart3, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { applicationService } from '@bhatbhati/shared/services/applicationService.js'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'
import {
  getBookingEmailDetails,
  recordApprovalEmailSent,
  sendBookingApprovalEmail,
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
  // Tab state: 'checks', 'payments', or 'statistics'
  const [activeTab, setActiveTab] = useState('checks')
  // Raw application data.
  const [applications, setApplications] = useState([])
  // Active filter for the table.
  const [statusFilter, setStatusFilter] = useState('all')
  // Chart period for stock-style chart
  const [chartPeriod, setChartPeriod] = useState('1W')
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
    const timer = window.setTimeout(() => {
      loadApplications()
    }, 0)
    return () => window.clearTimeout(timer)
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

  // ── Sales Statistics ──
  const salesStats = useMemo(() => {
    const now = new Date()
    const completedApps = applications.filter((a) => a.payment_status === 'completed' && a.total_price)

    const isWithin = (dateStr, days) => {
      if (!dateStr) return false
      const d = new Date(dateStr)
      const diff = (now - d) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= days
    }

    const todaySales = completedApps.filter((a) => isWithin(a.updated_at || a.created_at, 1))
    const weekSales = completedApps.filter((a) => isWithin(a.updated_at || a.created_at, 7))
    const monthSales = completedApps.filter((a) => isWithin(a.updated_at || a.created_at, 30))
    const prevWeekSales = completedApps.filter((a) => {
      const dateStr = a.updated_at || a.created_at
      if (!dateStr) return false
      const d = new Date(dateStr)
      const diff = (now - d) / (1000 * 60 * 60 * 24)
      return diff > 7 && diff <= 14
    })

    const sum = (arr) => arr.reduce((s, a) => s + Number(a.total_price || 0), 0)

    const weekRevenue = sum(weekSales)
    const prevWeekRevenue = sum(prevWeekSales)
    const weekGrowth = prevWeekRevenue > 0 ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 : weekRevenue > 0 ? 100 : 0

    // Daily breakdown for last 7 days
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now)
      dayDate.setDate(dayDate.getDate() - i)
      const dayStr = dayDate.toLocaleDateString('en-US', { weekday: 'short' })
      const dayApps = completedApps.filter((a) => {
        const d = new Date(a.updated_at || a.created_at)
        return d.toDateString() === dayDate.toDateString()
      })
      dailyData.push({ label: dayStr, revenue: sum(dayApps), count: dayApps.length })
    }

    // Hourly breakdown for today (1D chart — 24 points)
    const hourlyData = []
    for (let h = 0; h < 24; h++) {
      const hourApps = completedApps.filter((a) => {
        const d = new Date(a.updated_at || a.created_at)
        return d.toDateString() === now.toDateString() && d.getHours() === h
      })
      hourlyData.push({ label: `${h.toString().padStart(2, '0')}:00`, revenue: sum(hourApps), count: hourApps.length })
    }

    // Daily breakdown for last 30 days (1M chart — 30 points, scrollable)
    const monthlyDailyData = []
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now)
      dayDate.setDate(dayDate.getDate() - i)
      const dayStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayApps = completedApps.filter((a) => {
        const d = new Date(a.updated_at || a.created_at)
        return d.toDateString() === dayDate.toDateString()
      })
      monthlyDailyData.push({ label: dayStr, revenue: sum(dayApps), count: dayApps.length })
    }

    // Top vehicles
    const vehicleMap = {}
    completedApps.forEach((a) => {
      const name = a.vehicles?.name || 'Unknown'
      if (!vehicleMap[name]) vehicleMap[name] = { name, revenue: 0, count: 0 }
      vehicleMap[name].revenue += Number(a.total_price || 0)
      vehicleMap[name].count += 1
    })
    const topVehicles = Object.values(vehicleMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    return {
      today: { revenue: sum(todaySales), count: todaySales.length },
      week: { revenue: weekRevenue, count: weekSales.length },
      month: { revenue: sum(monthSales), count: monthSales.length },
      total: { revenue: sum(completedApps), count: completedApps.length },
      weekGrowth: Math.round(weekGrowth),
      dailyData,
      hourlyData,
      monthlyDailyData,
      topVehicles,
    }
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

          if (!approvalEmailBooking) {
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

      const shouldEmail = shouldSendApprovalEmail({
        currentStatus,
        nextStatus: status,
        booking: approvalEmailBooking,
      })

      if (shouldEmail) {
        await sendBookingApprovalEmail(approvalEmailBooking)
        await recordApprovalEmailSent(approvalEmailBooking.id)
      }
      await applicationService.updateStatus(id, status)
      await loadApplications()
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
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeTab === 'statistics'
              ? 'bg-brand-orange text-dark'
              : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Sales Statistics
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

      {/* STATISTICS TAB */}
      {activeTab === 'statistics' && (
        <>
          {/* Period Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Today', icon: Clock, ...salesStats.today, color: 'brand-orange' },
              { label: 'This Week', icon: Calendar, ...salesStats.week, color: 'status-green' },
              { label: 'This Month', icon: TrendingUp, ...salesStats.month, color: 'brand-city' },
              { label: 'All Time', icon: DollarSign, ...salesStats.total, color: 'status-yellow' },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 transition-all hover:border-dark-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-${card.color}/20 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 text-${card.color}`} />
                    </div>
                    <span className="text-xs text-txt-secondary uppercase tracking-wider font-semibold">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold m-0">NPR {card.revenue.toLocaleString()}</p>
                  <p className="text-[11px] text-txt-secondary mt-1 m-0">{card.count} completed sale{card.count !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>

          {/* Growth Indicator */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-5 mb-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              salesStats.weekGrowth >= 0 ? 'bg-status-green/20' : 'bg-status-red/20'
            }`}>
              {salesStats.weekGrowth >= 0
                ? <ArrowUpRight className="w-5 h-5 text-status-green" />
                : <ArrowDownRight className="w-5 h-5 text-status-red" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold m-0">Week-over-Week Growth</p>
              <p className={`text-2xl font-bold m-0 ${
                salesStats.weekGrowth >= 0 ? 'text-status-green' : 'text-status-red'
              }`}>
                {salesStats.weekGrowth >= 0 ? '+' : ''}{salesStats.weekGrowth}%
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-txt-secondary m-0">This week: NPR {salesStats.week.revenue.toLocaleString()}</p>
              <p className="text-xs text-txt-muted m-0">vs previous week</p>
            </div>
          </div>

          {/* Stock-Style Area Chart */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold m-0 mb-1">Revenue Chart</p>
                <p className="text-sm text-txt-muted m-0">
                  {chartPeriod === '1D' ? 'Hourly today' : chartPeriod === '1W' ? 'Last 7 days' : 'Last 4 weeks'}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-dark-border rounded-lg p-1">
                {['1D', '1W', '1M'].map((p) => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    className={`px-3.5 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                      chartPeriod === p ? 'bg-brand-orange text-dark' : 'text-txt-secondary hover:text-txt-primary'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const chartData = chartPeriod === '1D' ? (salesStats.hourlyData || [])
                : chartPeriod === '1W' ? (salesStats.dailyData || [])
                : (salesStats.monthlyDailyData || [])
              if (chartData.length === 0) return <p className="text-sm text-txt-secondary py-8 text-center">No data available</p>
              const maxRev = Math.max(...chartData.map(d => d.revenue), 1)
              const totalRev = chartData.reduce((s, d) => s + d.revenue, 0)
              const pointSpacing = 60
              const padX = 50, padY = 30, padB = 40
              const W = Math.max(padX * 2 + (chartData.length - 1) * pointSpacing, 700)
              const H = 240
              const chartW = W - padX * 2, chartH = H - padY - padB
              const points = chartData.map((d, i) => ({
                x: padX + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartW : chartW / 2),
                y: padY + chartH - (d.revenue / maxRev) * chartH,
                ...d,
              }))
              const pathD = points.length < 2 ? '' : points.reduce((acc, p, i) => {
                if (i === 0) return `M ${p.x} ${p.y}`
                const prev = points[i - 1]
                const cpx = (prev.x + p.x) / 2
                return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`
              }, '')
              const areaD = pathD ? `${pathD} L ${points[points.length - 1].x} ${H - padB} L ${points[0].x} ${H - padB} Z` : ''
              const labelStep = chartPeriod === '1D' ? 3 : chartPeriod === '1M' ? 2 : 1
              const isScrollable = W > 700

              return (
                <div className="relative">
                  {/* Total overlay — stays fixed */}
                  <div className="absolute top-0 right-0 text-right z-10">
                    <p className="text-[10px] text-txt-muted uppercase tracking-wider m-0">Total</p>
                    <p className="text-lg font-bold text-brand-orange m-0">NPR {totalRev.toLocaleString()}</p>
                  </div>
                  {/* Scroll hint */}
                  {isScrollable && (
                    <div className="absolute bottom-1 right-2 flex items-center gap-1.5 text-[10px] text-txt-muted z-10 bg-dark-deeper/80 px-2 py-1 rounded-md">
                      <span>← Scroll to explore →</span>
                    </div>
                  )}
                  {/* Scrollable chart container */}
                  <div className="overflow-x-auto" style={{ height: '260px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(211,116,47,0.3) transparent' }}>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: `${W}px` }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d3742f" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#d3742f" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#d3742f" stopOpacity="0.6" />
                          <stop offset="50%" stopColor="#d3742f" stopOpacity="1" />
                          <stop offset="100%" stopColor="#e8a060" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const y = padY + (i / 4) * chartH
                        const val = maxRev - (i / 4) * maxRev
                        return (
                          <g key={`g-${i}`}>
                            <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                            <text x={padX - 8} y={y + 4} textAnchor="end" fill="#73889a" fontSize="9" fontFamily="Inter, sans-serif">
                              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
                            </text>
                          </g>
                        )
                      })}
                      {areaD && <path d={areaD} fill="url(#areaGrad)" />}
                      {pathD && <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />}
                      {/* Data points & labels */}
                      {points.map((p, i) => (
                        <g key={`pt-${i}`}>
                          <circle cx={p.x} cy={p.y} r={p.revenue > 0 ? 4 : 2} fill={p.revenue > 0 ? '#d3742f' : 'rgba(211,116,47,0.3)'} stroke="#0c1317" strokeWidth="2" />
                          {p.revenue > 0 && (
                            <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#eff5f9" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
                              {p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}k` : p.revenue}
                            </text>
                          )}
                          {i % labelStep === 0 && (
                            <text x={p.x} y={H - padB + 16} textAnchor="middle" fill="#73889a" fontSize="9" fontFamily="Inter, sans-serif">
                              {p.label}
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* Top Vehicles */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold m-0 mb-1">Top Vehicles</p>
                  <p className="text-sm text-txt-muted m-0">By total revenue</p>
                </div>
                <TrendingUp className="w-5 h-5 text-txt-muted" />
              </div>
              <div className="space-y-3">
                {salesStats.topVehicles.length === 0 && (
                  <p className="text-sm text-txt-secondary">No completed sales yet.</p>
                )}
                {salesStats.topVehicles.map((v, i) => {
                  const maxRev = salesStats.topVehicles[0]?.revenue || 1
                  const pct = (v.revenue / maxRev) * 100
                  const colors = ['bg-brand-orange', 'bg-brand-city', 'bg-brand-nature', 'bg-status-yellow', 'bg-status-green']
                  return (
                    <div key={v.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-txt-muted w-5">#{i + 1}</span>
                          <span className="text-sm font-semibold">{v.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-brand-orange">NPR {v.revenue.toLocaleString()}</span>
                          <span className="text-[10px] text-txt-muted ml-2">{v.count} sale{v.count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-dark-deeper rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i] || 'bg-brand-orange'} rounded-full transition-all duration-1000`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sales Summary Table */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold mb-4 m-0">Sales Summary</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Transactions</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Avg / Sale</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { period: 'Today', ...salesStats.today },
                  { period: 'Last 7 Days', ...salesStats.week },
                  { period: 'Last 30 Days', ...salesStats.month },
                  { period: 'All Time', ...salesStats.total },
                ].map((row, i) => (
                  <tr key={row.period} className={i < 3 ? 'border-b border-dark-border/50' : ''}>
                    <td className="py-3 font-semibold">{row.period}</td>
                    <td className="py-3">{row.count}</td>
                    <td className="py-3 font-semibold text-brand-orange">NPR {row.revenue.toLocaleString()}</td>
                    <td className="py-3 text-txt-secondary">
                      NPR {row.count > 0 ? Math.round(row.revenue / row.count).toLocaleString() : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
