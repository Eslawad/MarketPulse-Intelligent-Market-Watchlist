import React, { useState } from 'react';
import { 
  User, 
  loginWithEmail, 
  registerWithEmail, 
  loginAnonymously, 
} from '../services/firebase';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LogIn,
  UserPlus,
  Compass,
  Zap,
  TrendingUp,
  Database,
  ArrowRight,
} from 'lucide-react';

interface LoginPageProps {
  user: User | null;
  onAuthSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ user, onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const newUser = await registerWithEmail(email.trim(), password, displayName.trim());
        onAuthSuccess(newUser);
      } else {
        const loggedUser = await loginWithEmail(email.trim(), password);
        onAuthSuccess(loggedUser);
      }
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you are new, click "Create an account" below.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err?.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const anonUser = await loginAnonymously();
      onAuthSuccess(anonUser);
    } catch {
      const fallbackGuestUser = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        email: 'guest.demo@marketpulse.local',
        displayName: 'Guest Trader',
        photoURL: null,
        isAnonymous: true,
        providerData: [],
      } as unknown as User;
      onAuthSuccess(fallbackGuestUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white">MarketPulse</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Intelligence</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Firestore Online
        </span>
      </header>

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isRegistering ? 'Create Your Account' : 'Sign In to Enter'}
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
                {isRegistering
                  ? 'Register to create customized watchlists, alert rules, and live market snapshot tracking.'
                  : 'Log in with your credentials to access the MarketPulse intelligence dashboard.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isRegistering && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Aditi Rao"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800/80 rounded-xl border border-slate-700/80 focus:outline-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@marketpulse.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800/80 rounded-xl border border-slate-700/80 focus:outline-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password (min 6 chars)"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-800/80 rounded-xl border border-slate-700/80 focus:outline-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
              >
                {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>
                  {loading
                    ? 'Authenticating...'
                    : isRegistering
                    ? 'Register & Enter Dashboard'
                    : 'Sign In & Enter Dashboard'}
                </span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create an account"}
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Enter as Demo Trader (Instant Access)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <Zap className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Change Engine</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Scored Attention</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Sub-Second</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Simulated Ticks</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <Database className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Cloud Sync</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Firestore ABAC</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-slate-800/80 text-[11px] text-slate-500">
        MarketPulse Intelligence • Secured by Firebase Authentication & Google Cloud Firestore
      </footer>
    </div>
  );
};
