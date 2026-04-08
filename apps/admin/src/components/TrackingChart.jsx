import { MapPin } from "lucide-react";

export default function TrackingChart({ activeUnits = 0 }) {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-base font-semibold m-0">Real-time Tracking</h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-green/20 text-status-green text-xs font-bold rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
          LIVE
        </span>
      </div>
      <p className="text-[13px] text-txt-secondary mb-6 m-0">
        Monitoring {activeUnits} active units across the valley.
      </p>

      {/* Chart Area */}
      <div className="tracking-chart bg-dark-deeper rounded-lg border border-dark-border relative">
        <div className="chart-gradient" />
        <svg className="w-full h-full relative z-10" viewBox="0 0 700 200" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="50" x2="700" y2="50" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="0" y1="100" x2="700" y2="100" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="0" y1="150" x2="700" y2="150" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4" />

          {/* Area fill */}
          <path d="M0 180 Q50 160 100 140 T200 100 T300 80 T400 60 T500 70 T600 50 T700 40 L700 200 L0 200 Z" fill="rgba(255,143,63,0.08)" />
          <path d="M0 190 Q50 175 100 165 T200 150 T300 140 T400 130 T500 135 T600 120 T700 110 L700 200 L0 200 Z" fill="rgba(160,160,160,0.05)" />

          {/* Main line */}
          <path d="M0 180 Q50 160 100 140 T200 100 T300 80 T400 60 T500 70 T600 50 T700 40" fill="none" stroke="#ff8f3f" strokeWidth="2" />
          {/* Secondary line */}
          <path d="M0 190 Q50 175 100 165 T200 150 T300 140 T400 130 T500 135 T600 120 T700 110" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeDasharray="4" />

          {/* Data points - main */}
          {[[100,140],[200,100],[300,80],[400,60],[500,70],[600,50]].map(([cx,cy], i) => (
            <circle key={`m${i}`} cx={cx} cy={cy} r={4} fill="#ff8f3f" stroke="#1a1a1a" strokeWidth={2} />
          ))}
          {/* Data points - secondary */}
          {[[100,165],[200,150],[300,140],[400,130],[500,135],[600,120]].map(([cx,cy], i) => (
            <circle key={`s${i}`} cx={cx} cy={cy} r={3} fill="#6b6b6b" stroke="#1a1a1a" strokeWidth={2} />
          ))}
        </svg>

        {/* Location pin */}
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center shadow-lg">
          <MapPin className="w-4 h-4 text-dark" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <span className="flex items-center gap-2 text-xs text-txt-secondary">
          <span className="w-2 h-2 rounded-full bg-brand-orange" />
          Active
        </span>
        <span className="flex items-center gap-2 text-xs text-txt-secondary">
          <span className="w-2 h-2 rounded-full bg-status-green" />
          On Route
        </span>
      </div>
    </div>
  );
}
