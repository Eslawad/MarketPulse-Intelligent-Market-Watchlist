import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  HelpCircle, 
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Search,
  Bell,
  Sliders,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Benchmark, ProviderStatus, MarketState } from '../types/market';
import { User } from 'firebase/auth';

interface HeaderProps {
  marketState: MarketState;
  onStatusChange: (status: ProviderStatus) => void;
  lastSnapshotTime: string | null;
  onUpdateSnapshot: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenArchitecture: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  marketState,
  onStatusChange,
  lastSnapshotTime,
  onUpdateSnapshot,
  user,
  onSignIn,
  onSignOut,
  onOpenArchitecture,
  searchQuery = '',
  onSearchChange,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenSettings,
  isMuted = false,
  onToggleMute,
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const getStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500 animate-pulse',
          label: 'Live Stream',
        };
      case 'DELAYED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: '15m Delayed',
        };
      case 'STALE':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
          label: 'Stale Cache',
        };
      case 'UNAVAILABLE':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Offline',
        };
    }
  };

  const statusBadge = getStatusBadge(marketState.providerStatus);

  const formatSnapshotTime = (iso: string | null) => {
    if (!iso) return 'Not recorded';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30">
      {/* Top Banner if Stale or Unavailable */}
      {marketState.providerStatus === 'STALE' && (
        <div className="absolute top-16 left-0 right-0 bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Feed Notice:</strong> Live provider is delayed. Serving verified snapshot from {new Date(marketState.lastUpdated).toLocaleTimeString()}.
            </span>
          </div>
        </div>
      )}
      {marketState.providerStatus === 'UNAVAILABLE' && (
        <div className="absolute top-16 left-0 right-0 bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs text-rose-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Feed Offline:</strong> Real-time connection degraded. System gracefully serving deterministic fallback cache.
            </span>
          </div>
        </div>
      )}

      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs">
          <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-800">
            MarketPulse
          </span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Engine
          </span>
        </div>
      </div>

      {/* Center Search Input & Benchmarks */}
      <div className="hidden md:flex items-center gap-6">
        {onSearchChange && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ticker or record..."
              className="bg-slate-100 border-none rounded-full py-1.5 px-4 text-sm w-56 lg:w-64 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        )}

        {/* Benchmarks */}
        <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">NIFTY:</span>
            <span className="font-bold text-slate-900">
              {marketState.benchmarkNifty.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
            </span>
            <span className="text-emerald-600 font-bold">
              +{marketState.benchmarkNifty.changePercent}%
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">SENSEX:</span>
            <span className="font-bold text-slate-900">
              {marketState.benchmarkSensex.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
            </span>
            <span className="text-emerald-600 font-bold">
              +{marketState.benchmarkSensex.changePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <div className="relative">
          <button
            id="market-status-btn"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.bg} transition-colors hover:opacity-90 cursor-pointer`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </button>

          {statusDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
              onClick={() => setStatusDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Simulate Feed State
              </div>
              <button
                onClick={() => onStatusChange('LIVE')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-800">Live Stream</div>
                  <div className="text-[10px] text-slate-400">Sub-second feed</div>
                </div>
              </button>
              <button
                onClick={() => onStatusChange('DELAYED')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <div className="font-semibold text-slate-800">15m Delayed</div>
                  <div className="text-[10px] text-slate-400">Exchange standard delay</div>
                </div>
              </button>
              <button
                onClick={() => onStatusChange('STALE')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <div>
                  <div className="font-semibold text-slate-800">Stale Cache</div>
                  <div className="text-[10px] text-slate-400">Frozen historical snapshot</div>
                </div>
              </button>
              <button
                onClick={() => onStatusChange('UNAVAILABLE')}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <div>
                  <div className="font-semibold text-slate-800">Provider Offline</div>
                  <div className="text-[10px] text-slate-400">Fallback mock recovery</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Snapshot Quick Action */}
        <button
          onClick={onUpdateSnapshot}
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          title="Update baseline snapshot"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Snapshot: <strong>{formatSnapshotTime(lastSnapshotTime)}</strong></span>
        </button>

        {/* Formula Weight Configurator */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Calibrate Attention Formula Weights"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Audio Alert Chimes Toggle */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isMuted
                ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={isMuted ? 'Sound Muted (click to enable alert chimes)' : 'Alert Sound Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Notification Event Tray Bell */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
            title="Live Alert Notification Stream"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {/* Architecture Button */}
        <button
          onClick={onOpenArchitecture}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Architecture & Formula Blueprint"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Auth Profile */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
              title="View Account Profile"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">
                  {user.email?.slice(0, 2).toUpperCase() || 'US'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-slate-700 truncate max-w-[110px]">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Firestore Active
                </div>
              </div>
            </button>
            <button
              onClick={onSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In / Register</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
