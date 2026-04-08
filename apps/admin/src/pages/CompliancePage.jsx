import { FileText, Lock, Unlock, Filter, AlertTriangle } from "lucide-react";
import { consumerLogs } from "@/lib/data";

const kycStyles = {
  "VERIFIED": "bg-status-green/20 text-status-green",
  "PENDING REVIEW": "bg-status-yellow/20 text-status-yellow",
  "REJECTED": "bg-status-red/20 text-status-red",
};

export default function CompliancePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Compliance & Logs</h2>
        <span className="px-2.5 py-1 bg-status-green/20 text-status-green text-xs font-bold rounded-full">
          SECURE NODE
        </span>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 mb-8">
        {/* Document Verification */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Document Verification Vault</h3>
              <p className="text-xs text-txt-secondary">Pending review: 14 active applications</p>
            </div>
            <span className="px-3 py-1 bg-brand-orange/20 text-brand-orange text-xs rounded-full font-semibold">
              Priority Processing
            </span>
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-orange" />
                Passport / Citizenship Scan
              </p>
              <div className="bg-dark-deeper rounded-lg p-4 flex items-center gap-4">
                <div className="w-24 h-28 bg-dark-border rounded-lg flex items-center justify-center text-4xl">👤</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-txt-secondary">Facial Match</span>
                    <span className="text-sm font-bold text-status-green">98.2%</span>
                  </div>
                  <p className="text-xs text-status-green mb-1">✓ Machine readable zone (MRZ) valid</p>
                  <p className="text-xs text-status-green">✓ Expiry date check passed</p>
                </div>
              </div>
              <p className="text-xs text-txt-secondary mt-3">ID: 7129-NPL</p>
              <p className="text-sm mt-1">
                <span className="text-xs text-txt-secondary">APPLICANT NAME:</span>
                <br />
                <strong>Prakash Gyawali</strong>
              </p>
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-status-green/20 text-status-green rounded-md text-sm font-semibold hover:bg-status-green/30 transition-colors">
                  ✓ Approve
                </button>
                <button className="px-4 py-2 bg-status-red/20 text-status-red rounded-md text-sm font-semibold hover:bg-status-red/30 transition-colors">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FNMIS Engine */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <p className="font-semibold text-sm">FNMIS Engine</p>
              <p className="text-xs text-txt-secondary">6-Digit Secure Protocol</p>
            </div>
          </div>
          <p className="text-xs text-txt-secondary uppercase tracking-wider mb-2">Current Session Token</p>
          <div className="flex gap-1 mb-4">
            {["3", "8", "2", "9", "0", "1"].map((d, i) => (
              <span
                key={i}
                className="w-10 h-12 bg-dark-deeper border border-dark-border rounded flex items-center justify-center text-xl font-bold text-brand-orange"
              >
              {d}
              </span>
            ))}
          </div>
          <p className="text-xs text-status-red text-center mb-4">● EXPIRES IN: 02:14</p>
          <button className="w-full py-2 border border-brand-orange text-brand-orange rounded-md text-sm font-semibold hover:bg-brand-orange/10 transition-colors mb-2">
            ↻ Generate Token
          </button>
          <button className="w-full py-2 border border-dark-border text-txt-secondary rounded-md text-sm hover:text-txt-primary transition-colors">
            ↻ View Audit Log
          </button>
        </div>
      </div>

      {/* Active Consumer Logs */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Active Consumer Logs</h3>
            <p className="text-xs text-txt-secondary">Real-time telemetry and compliance status</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-dark-border text-txt-secondary rounded-md text-xs hover:text-brand-orange transition-colors flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Status
            </button>
            <button className="px-3 py-1.5 bg-status-red/20 text-status-red rounded-md text-xs font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Purge Data
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-txt-secondary uppercase tracking-wider border-b border-dark-border">
              <th className="pb-3">Rental ID</th>
              <th className="pb-3">Consumer Name</th>
              <th className="pb-3">Vehicle Node</th>
              <th className="pb-3">KYC Status</th>
              <th className="pb-3">Encryption</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consumerLogs.map((log, i) => (
              <tr key={log.id} className={i < consumerLogs.length - 1 ? "border-b border-dark-border/50" : ""}>
                <td className="py-3 text-txt-secondary">{log.rentalId}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${log.initialsColor} flex items-center justify-center text-xs font-bold ${log.initialsColor === "bg-brand-orange" ? "text-dark" : ""}`}>
                      {log.initials}
                    </div>
                    <span>{log.name}</span>
                  </div>
                </td>
                <td className="text-txt-secondary">{log.vehicle}</td>
                <td>
                  <span className={`px-2 py-0.5 ${kycStyles[log.kycStatus]} text-xs rounded font-semibold`}>
                    {log.kycStatus}
                  </span>
                </td>
                <td className="text-txt-secondary">
                  {log.encrypted ? (
                    <Lock className="w-4 h-4 text-status-green" />
                  ) : (
                    <Unlock className="w-4 h-4 text-status-red" />
                  )}
                </td>
                <td className="text-txt-secondary cursor-pointer">⋮</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
