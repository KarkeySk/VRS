import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@bhatbhati/shared/services/authService.js";
import {
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  Bell,
  Globe,
  Camera,
  Eye,
  EyeOff,
  LogOut,
  Key,
  Clock,
  Monitor,
  Smartphone,
  CheckCircle,
} from "lucide-react";

export default function AdminProfilePage({ onNavigate }) {
  const navigate = useNavigate();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authService.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to sign out:", err);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Admin Profile</h2>
        <span className="text-sm text-txt-secondary">Account Settings</span>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left: Main Content */}
        <div className="space-y-6">

          {/* Profile Card */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-xl bg-brand-orange flex items-center justify-center text-3xl font-bold text-dark">
                  <User className="w-12 h-12" />
                </div>
                <button className="absolute inset-0 rounded-xl bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-none">
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-status-green rounded-full border-2 border-dark-deeper" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Chakuu</h3>
                <p className="text-sm text-brand-orange font-semibold mb-1">Fleet Director</p>
                <p className="text-xs text-txt-secondary mb-3">Member since January 2024 · Kathmandu, Nepal</p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-status-green/20 text-status-green text-[10px] font-bold rounded-full uppercase">Active</span>
                  <span className="px-2.5 py-1 bg-brand-orange/20 text-brand-orange text-[10px] font-bold rounded-full uppercase">Super Admin</span>
                  <span className="px-2.5 py-1 bg-[rgba(100,150,200,0.2)] text-[#64d4ff] text-[10px] font-bold rounded-full uppercase">Verified</span>
                </div>
              </div>

              <button className="text-xs text-brand-orange border border-brand-orange px-4 py-2 rounded-lg hover:bg-brand-orange/10 transition-colors cursor-pointer bg-transparent font-semibold">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  defaultValue="Chakuu Bhatbhateni"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Display Name</label>
                <input
                  type="text"
                  defaultValue="Chakuu"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  defaultValue="chakuu@bhatbhatifleet.com"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+977 9841-XXXXXX"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Timezone
                </label>
                <input
                  type="text"
                  defaultValue="Asia/Kathmandu (NPT +05:45)"
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-primary focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Role</label>
                <input
                  type="text"
                  defaultValue="Fleet Director — Super Admin"
                  readOnly
                  className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 text-sm text-txt-secondary cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-orange" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-txt-secondary mb-1.5 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary hover:text-txt-primary transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      placeholder="Enter new password"
                      className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary hover:text-txt-primary transition-colors"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-txt-secondary mb-1.5 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="Re-enter new password"
                      className="w-full bg-dark-deeper border border-dark-border rounded-lg px-3 py-2.5 pr-10 text-sm text-txt-primary placeholder-txt-muted focus:border-brand-orange focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-txt-secondary hover:text-txt-primary transition-colors"
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {/* Password strength hints */}
              <div className="bg-dark-deeper rounded-lg p-3">
                <p className="text-[10px] text-txt-secondary uppercase tracking-wider font-semibold mb-2">Password Requirements</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "At least 8 characters",
                    "One uppercase letter",
                    "One lowercase letter",
                    "One number or symbol",
                  ].map((req) => (
                    <span key={req} className="text-[11px] text-txt-secondary flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-txt-muted" /> {req}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn-action px-6 py-2.5 text-sm">Update Password</button>
            </div>
          </div>

          {/* Security & Two-Factor */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-orange" /> Security Settings
            </h3>

            {/* Two-Factor Auth */}
            <div className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-orange/20 flex items-center justify-center">
                  <Key className="w-4 h-4 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-xs text-txt-secondary">Extra security for your account</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-11 h-6 rounded-full relative cursor-pointer border-none transition-colors ${twoFactor ? "bg-brand-orange" : "bg-dark-border"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${twoFactor ? "right-0.5 bg-white" : "left-0.5 bg-txt-secondary"}`} />
              </button>
            </div>

            {/* Active Sessions */}
            <p className="text-xs text-txt-secondary uppercase tracking-wider font-semibold mb-3">Active Sessions</p>
            <div className="space-y-2">
              {[
                { device: "Windows PC — Chrome", location: "Kathmandu, Nepal", time: "Current session", icon: Monitor, current: true },
                { device: "iPhone 15 Pro — Safari", location: "Pokhara, Nepal", time: "2 hours ago", icon: Smartphone, current: false },
              ].map((session) => {
                const Icon = session.icon;
                return (
                  <div key={session.device} className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dark-border flex items-center justify-center">
                        <Icon className="w-4 h-4 text-txt-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <span className="px-1.5 py-0.5 bg-status-green/20 text-status-green text-[9px] font-bold rounded uppercase">Current</span>
                          )}
                        </p>
                        <p className="text-xs text-txt-secondary">{session.location} · {session.time}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="text-xs text-status-red hover:text-status-red/80 transition-colors bg-transparent border-none cursor-pointer font-semibold">
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-orange" /> Notification Preferences
            </h3>
            <div className="space-y-3">
              {[
                { id: "email", label: "Email Notifications", desc: "Booking alerts, compliance updates", value: notifEmail, toggle: setNotifEmail },
                { id: "sms", label: "SMS Alerts", desc: "Critical fleet warnings only", value: notifSms, toggle: setNotifSms },
                { id: "push", label: "Push Notifications", desc: "Real-time updates in browser", value: notifPush, toggle: setNotifPush },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between bg-dark-deeper rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{pref.label}</p>
                    <p className="text-xs text-txt-secondary">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => pref.toggle(!pref.value)}
                    className={`w-11 h-6 rounded-full relative cursor-pointer border-none transition-colors ${pref.value ? "bg-brand-orange" : "bg-dark-border"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${pref.value ? "right-0.5 bg-white" : "left-0.5 bg-txt-secondary"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save & Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 text-sm text-status-red hover:text-status-red/80 transition-colors bg-transparent border-none cursor-pointer font-semibold disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" /> {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate("dashboard")}
                className="text-sm text-txt-secondary hover:text-txt-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
              <button className="btn-action px-8 py-2.5 text-sm">Save Changes</button>
            </div>
          </div>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-4">
          {/* Account Overview */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Account Overview</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-orange flex items-center justify-center">
                  <User className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <p className="text-sm font-bold">Chakuu</p>
                  <p className="text-[10px] text-txt-secondary">Fleet Director</p>
                </div>
              </div>
              <div className="border-t border-dark-border pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary">Account Status</span>
                  <span className="text-status-green font-semibold">Active</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary">Role</span>
                  <span className="text-brand-orange font-semibold">Super Admin</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary">2FA</span>
                  <span className={`font-semibold ${twoFactor ? "text-status-green" : "text-status-red"}`}>
                    {twoFactor ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-dark-border rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {[
                { action: "Password changed", time: "3 days ago", color: "text-brand-orange" },
                { action: "New vehicle added", time: "5 days ago", color: "text-status-green" },
                { action: "Booking #bk-003 approved", time: "1 week ago", color: "text-[#64d4ff]" },
                { action: "Login from new device", time: "2 weeks ago", color: "text-status-yellow" },
              ].map((item) => (
                <div key={item.action} className="flex items-start gap-2">
                  <Clock className="w-3 h-3 text-txt-muted mt-0.5 shrink-0" />
                  <div>
                    <p className={`text-xs font-semibold ${item.color}`}>{item.action}</p>
                    <p className="text-[10px] text-txt-muted">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-status-red/30 rounded-xl p-6">
            <h4 className="text-sm font-semibold mb-2 text-status-red">Danger Zone</h4>
            <p className="text-xs text-txt-secondary mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="w-full py-2.5 bg-status-red/20 border border-status-red/30 text-status-red rounded-md text-xs font-semibold hover:bg-status-red/30 transition-colors cursor-pointer">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
