import { useEffect, useMemo, useState } from 'react'
import { FileText, Filter, ExternalLink } from 'lucide-react'
import { applicationService } from '@bhatbhati/shared/services/applicationService.js'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'

const statusStyles = {
  submitted: 'bg-status-yellow/20 text-status-yellow',
  'under-review': 'bg-brand-orange/20 text-brand-orange',
  approved: 'bg-status-green/20 text-status-green',
  rejected: 'bg-status-red/20 text-status-red',
  confirmed: 'bg-[rgba(100,150,200,0.2)] text-[#64d4ff]',
  cancelled: 'bg-dark-border text-txt-secondary',
}

export default function CompliancePage() {
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

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

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return applications
    return applications.filter((app) => app.status === statusFilter)
  }, [applications, statusFilter])

  const pendingCount = applications.filter((app) => ['submitted', 'under-review'].includes(app.status)).length

  const updateStatus = async (id, status) => {
    setBusyId(id)
    try {
      if (status === 'approved') {
        const target = applications.find((app) => app.id === id)
        if (target) {
          const existing = await bookingService.findMatchingTrip({
            userId: target.user_id,
            vehicleId: target.vehicle_id,
            startDate: target.start_date,
            endDate: target.end_date,
          })

          if (!existing) {
            await bookingService.create({
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
          }
        }
      }

      await applicationService.updateStatus(id, status)
      await loadApplications()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setBusyId('')
    }
  }

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
        <div className="flex items-center gap-2">
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
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-status-red/30 bg-status-red/10 px-3 py-2 text-xs text-status-red">
          {error}
        </div>
      )}

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
    </div>
  )
}
