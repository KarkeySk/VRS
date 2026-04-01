import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to login');
      // If Supabase is not configured, it will throw an error, so we can mock navigation for now
      if (err.message === 'Supabase is not configured') {
        navigate('/profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/landing.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0a0a0a]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[#161616]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mx-4">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Bhatbhati Logo" className="h-20 w-auto object-contain mb-2 drop-shadow-md filter sepia-[0.3] hue-rotate-[340deg] saturate-[3] hover:scale-105 transition-transform" />
          {/* Logo usually has text in the image, so we don't necessarily need text here, but fallbacks are nice */}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400">Your next Himalayan ascent begins here.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </span>
              <input 
                type="email" 
                placeholder="explorer@summit.com" 
                className="w-full bg-[#111111] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all placeholder-gray-600 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Secret Key</label>
              <Link to="#" className="text-xs font-semibold text-[#fcab74] hover:text-[#ffdacc] transition-colors tracking-wider uppercase">Forgot?</Link>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#111111] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#fcab74] focus:ring-1 focus:ring-[#fcab74] transition-all placeholder-gray-600 tracking-widest shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#ffad76] hover:bg-[#ffc299] text-[#5c2a11] font-bold py-3.5 rounded-2xl transition-all shadow-[0_4px_15px_rgba(255,173,118,0.3)] hover:shadow-[0_4px_25px_rgba(255,173,118,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? 'Authenticating...' : 'Enter the Expedition'}
            {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </form>

        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-[#161616] px-4 text-gray-500 tracking-widest uppercase">Social Verification</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 py-3 bg-[#111111] border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-sm text-gray-300 font-medium group">
            <svg className="w-4 h-4 text-[#7b81ff] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            Biometric
          </button>
          <button type="button" className="flex items-center justify-center gap-2 py-3 bg-[#111111] border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-sm text-gray-300 font-medium group">
            <svg className="w-4 h-4 text-[#ff5c5c] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
            Google
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          New to the summit? <Link to="/auth/register" className="text-[#fcab74] hover:text-[#ffc299] transition-colors font-semibold ml-1">Request an Invite</Link>
        </div>
      </div>
      
      {/* Bottom left info bubbles */}
      <div className="absolute bottom-10 left-10 flex-col gap-4 hidden lg:flex z-10">
        <div className="flex items-center gap-4 bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-full py-2.5 px-5 shadow-2xl">
          <div className="bg-[#1e1a3b] p-2.5 rounded-full text-[#7b81ff]">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-0.5">Base Camp Temp</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-base leading-none">-14°C</span>
              <span className="text-xs text-[#7b81ff] font-medium leading-none">Everest</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-full py-2.5 px-5 shadow-2xl">
          <div className="bg-[#3a2015] p-2.5 rounded-full text-[#fcab74]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
             <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-0.5">Active Expeditions</div>
             <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-base leading-none">42</span>
              <span className="text-xs text-[#fcab74] font-medium leading-none">Teams</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-8 w-full text-center md:flex md:justify-between md:px-14 text-[9px] text-gray-500 uppercase tracking-[0.2em] font-medium z-10 hidden md:block">
        <div>© 2024 BHATBHATI TOURS & TRAVEL. THE ETHEREAL EXPEDITION.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Ascent</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Safety Protocol</a>
        </div>
      </div>
    </div>
  );
}
