import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terrain, setTerrain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signUp(email, password, { full_name: fullname, terrain_preference: terrain });
      // If sign up doesn't auto-login or if email confirmation is required, handle here.
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
      if (err.message === 'Supabase is not configured') {
        navigate('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background Image - same as login */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/landing.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0a0a0a]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[#161616]/90 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] mx-4 my-8">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Bhatbhati Logo" className="h-16 w-auto object-contain mb-3 drop-shadow-md filter sepia-[0.3] hue-rotate-[340deg] saturate-[3] hover:scale-105 transition-transform" />
          <h1 className="text-xl font-bold text-[#ffd2b6] tracking-[0.15em] uppercase text-center drop-shadow-sm">Bhatbhatify</h1>
          <p className="text-[9px] text-gray-500 tracking-[0.2em] uppercase mt-1">The Ethereal Expedition</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Full Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-[#111111]/80 border border-white/5 rounded-[1.25rem] py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all placeholder-gray-600 shadow-inner"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <input 
                type="email" 
                placeholder="explorer@horizon.com" 
                className="w-full bg-[#111111]/80 border border-white/5 rounded-[1.25rem] py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all placeholder-gray-600 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#111111]/80 border border-white/5 rounded-[1.25rem] py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all placeholder-gray-600 tracking-widest shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Terrain Preference */}
          <div className="space-y-1.5 pb-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Terrain Preference</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </span>
              <select 
                className="w-full bg-[#111111]/80 border border-white/5 rounded-[1.25rem] py-3.5 pl-11 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all appearance-none cursor-pointer shadow-inner"
                value={terrain}
                onChange={(e) => setTerrain(e.target.value)}
                required
              >
                <option value="" disabled>Select your territory</option>
                <option value="mountains">High Altitude Mountains</option>
                <option value="valley">Kathmandu Valley</option>
                <option value="offroad">Off-road Trails</option>
                <option value="highway">Highways</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#ffad76] hover:bg-[#ffc299] text-[#5c2a11] font-bold py-3.5 rounded-2xl transition-all shadow-[0_4px_15px_rgba(255,173,118,0.25)] hover:shadow-[0_4px_25px_rgba(255,173,118,0.4)] mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : 'Join the Expedition'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          Already a member? <Link to="/auth/login" className="text-[#fcab74] hover:text-[#ffc299] transition-colors font-bold ml-1">Back to Login</Link>
        </div>

        {/* Bottom Icons Row */}
        <div className="flex justify-center items-center gap-6 mt-6 pt-6 border-t border-white/5">
          <button className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </button>
          <button className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </button>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-6 w-full text-center md:flex md:justify-between md:px-14 text-[9px] text-gray-600 lowercase tracking-wider font-medium z-10 hidden md:block">
        <div>© 2024 himalayan horizon. the ethereal expedition.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gray-400 transition-colors capitalize">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400 transition-colors capitalize">Sustainability</a>
        </div>
      </div>
    </div>
  );
}
