export default function HeroBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden mb-6" style={{ minHeight: 180 }}>
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop"
        alt="Himalayan Mountains"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,25,40,0.85)] via-[rgba(15,25,40,0.6)] to-[rgba(15,25,40,0.3)]" />
      {/* Content */}
      <div className="relative z-10 p-8 flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-3">
            Active Expeditions
          </p>
          <h2 className="text-3xl font-bold m-0 mb-2">Today's Fleet Pulse</h2>
          <p className="text-sm text-txt-secondary m-0">
            12 active rentals navigating the Annapurna
            <br />
            Circuit, 4 scheduled for return by sunset.
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <span className="text-3xl font-bold text-brand-orange block">24</span>
            <span className="text-xs text-txt-secondary uppercase tracking-wider">Upcoming</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-txt-primary block">08</span>
            <span className="text-xs text-txt-secondary uppercase tracking-wider">Returned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
