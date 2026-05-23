export default function StatsCard({ label, value, description, progress, barColor = "bg-brand-orange" }) {
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold mb-4 m-0">
        {label}
      </p>
      <p className="text-4xl font-bold m-0 mb-1">{value}</p>
      <p className="text-[13px] text-txt-secondary mb-4 m-0">{description}</p>
      <div className="w-full h-2 bg-dark-deeper rounded-full overflow-hidden">
        <div
          className={`progress-bar h-full ${barColor} rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
