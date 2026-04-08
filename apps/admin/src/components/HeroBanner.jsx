export default function HeroBanner({ imageUrl = "", upcomingCount = 0, returnedCount = 0, activeCount = 0 }) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-6" style={{ minHeight: 180 }}>
      {/* Background Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Himalayan Mountains"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#253341_0%,#1d2733_55%,#0f172a_100%)]" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,25,40,0.85)] via-[rgba(15,25,40,0.6)] to-[rgba(15,25,40,0.3)]" />
      {/* Content */}
      <div className="relative z-10 p-8 flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-3">
            Active Trips
          </p>
          <h2 className="text-3xl font-bold m-0 mb-2">Fleet Update</h2>
          <p className="text-sm text-txt-secondary m-0">
            {activeCount} vehicles are in use now
            <br />
            and {returnedCount} trips are done.
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <span className="text-3xl font-bold text-brand-orange block">{upcomingCount}</span>
            <span className="text-xs text-txt-secondary uppercase tracking-wider">Upcoming</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-txt-primary block">{returnedCount}</span>
            <span className="text-xs text-txt-secondary uppercase tracking-wider">Returned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
