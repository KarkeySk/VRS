/*
  StatsCard notes:
  - Presentational component only.
  - label renders the small heading.
  - value renders the primary metric.
  - description provides context below.
  - progress is a 0-100 percent width.
  - barColor controls the fill class.
  - Caller owns formatting.
  - Safe to memoize if needed.
  - No side effects or state.
  - Designed for dashboard tiles.
*/
export default function StatsCard({ label, value, description, progress, barColor = "bg-brand-orange" }) {
  // Reusable stat widget with a progress bar.
  // label: short label for the stat.
  // value: main metric text.
  // description: helper line below value.
  // progress: percent used for the bar width.
  // barColor: tailwind class for the bar fill.
  // No internal state; rendering is fully declarative.
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
      <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold mb-4 m-0">
        {label}
      </p>
      <p className="text-4xl font-bold m-0 mb-1">{value}</p>
      <p className="text-[13px] text-txt-secondary mb-4 m-0">{description}</p>
      <div className="w-full h-2 bg-dark-deeper rounded-full overflow-hidden">
        {/* Width is driven by a percent from the parent. */}
        <div
          className={`progress-bar h-full ${barColor} rounded-full`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
