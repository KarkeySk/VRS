import { Map, User, Cog, Edit, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Terrain Configuration</h2>
        <span className="px-3 py-1.5 border border-brand-orange text-brand-orange rounded-md text-xs font-semibold uppercase tracking-wider">
          Global Thresholds
        </span>
      </div>
      <p className="text-sm text-txt-secondary mb-6">Define operational logic based on Himalayan topography.</p>

      <div className="grid grid-cols-[1fr_280px] gap-6 mb-8">
        {/* 4WD Recommendations */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-orange/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-brand-orange" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-orange">3,500m</p>
              <p className="text-xs text-txt-secondary uppercase">Active Threshold</p>
            </div>
          </div>
          <h3 className="text-base font-semibold mb-2">4WD Recommendations</h3>
          <p className="text-xs text-txt-secondary mb-6 leading-relaxed">
            System-wide trigger for mandatory 4WD vehicle assignment based on route altitude and incline data.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-t border-dark-border pt-3">
              <span className="text-sm text-txt-secondary">Mandatory Threshold (Meters)</span>
              <input
                type="text"
                defaultValue="3500"
                className="w-20 bg-dark-deeper border border-dark-border rounded px-3 py-1 text-sm text-right text-txt-primary"
              />
            </div>
            <div className="flex items-center justify-between border-t border-dark-border pt-3">
              <span className="text-sm text-txt-secondary">Steepness Sensitivity (Grade %)</span>
              <input
                type="text"
                defaultValue="15%"
                className="w-20 bg-dark-deeper border border-dark-border rounded px-3 py-1 text-sm text-right text-txt-primary"
              />
            </div>
          </div>
        </div>

        {/* Climate Alerts */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-base font-semibold mb-2">Climate Alerts</h3>
          <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
            Automatic operational suspension based on real-time weather feeds.
          </p>
          <div className="text-5xl text-center mb-4">❄️</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-dark-deeper rounded-lg px-3 py-2.5">
              <span className="text-xs">❄ Snowfall &gt; 5cm</span>
              <div className="w-10 h-5 bg-brand-orange rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between bg-dark-deeper rounded-lg px-3 py-2.5">
              <span className="text-xs">💨 Gale &gt; 40km/h</span>
              <div className="w-10 h-5 bg-dark-border rounded-full relative">
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-txt-secondary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles + Privacy */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* User Roles */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">User Roles</h3>
          <div className="space-y-3">
            {[
              { title: "Fleet Manager", desc: "Full control over vehicles and routes", icon: User },
              { title: "Booking Agent", desc: "View access with customer management", icon: User },
              { title: "Tech Admin", desc: "System settings and API controls", icon: Cog },
            ].map((role) => (
              <div key={role.title} className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                    <role.icon className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{role.title}</p>
                    <p className="text-xs text-txt-secondary">{role.desc}</p>
                  </div>
                </div>
                <span className="text-txt-secondary cursor-pointer hover:text-brand-orange transition-colors">
                  <Edit className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-brand-orange text-sm font-semibold hover:text-brand-orange-dark transition-colors bg-transparent border-none cursor-pointer">
            + Create Custom Role
          </button>
        </div>

        {/* Privacy & Data Purge */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Privacy & Data Purge</h3>
          <div className="border border-status-red/30 rounded-lg p-4 mb-4">
            <p className="text-xs text-status-red uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Destructive Actions
            </p>
            <p className="text-xs text-txt-secondary leading-relaxed">
              Automate the removal of sensitive client data following successful expedition completion.{" "}
              <span className="text-brand-orange cursor-pointer underline">Legal compliance: Nepal Data Act 2024.</span>
            </p>
          </div>
          <div className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-semibold">Auto-Purge Inactive Records</p>
              <p className="text-xs text-txt-secondary">Remove data for 6+ months</p>
            </div>
            <div className="w-10 h-5 bg-brand-orange rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <button className="w-full py-2.5 bg-status-red/20 border border-status-red/30 text-status-red rounded-md text-sm font-semibold hover:bg-status-red/30 transition-colors flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Execute Manual System Purge
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer">
          Discard Changes
        </button>
        <button className="btn-action px-8 py-2.5 text-sm">Save Changes</button>
      </div>
    </div>
  );
}
