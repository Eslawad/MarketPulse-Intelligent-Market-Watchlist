import React from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  TrendingDown, 
  SunMedium, 
  AlertTriangle, 
  Play, 
  Pause,
  RefreshCw,
  Camera
} from 'lucide-react';
import { ProviderStatus } from '../types/market';

interface ScenarioBarProps {
  onApplyScenarioBreakout: () => void;
  onApplyScenarioEarningsFall: () => void;
  onApplyScenarioCalm: () => void;
  onSetStatus: (status: ProviderStatus) => void;
  currentStatus: ProviderStatus;
  isSimulatingLiveTicks: boolean;
  onToggleLiveTicks: () => void;
  onFreezeSnapshot: () => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  onApplyScenarioBreakout,
  onApplyScenarioEarningsFall,
  onApplyScenarioCalm,
  onSetStatus,
  currentStatus,
  isSimulatingLiveTicks,
  onToggleLiveTicks,
  onFreezeSnapshot,
}) => {
  return (
    <div className="bg-slate-900 text-slate-400 rounded-2xl p-5 shadow-sm border border-slate-800 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Evaluation & Stress Test Suite
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30">
                Live Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantly trigger real-world market movements to test the Meaningful Change Engine.
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario 1 */}
          <button
            onClick={onApplyScenarioBreakout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
            title="RELIANCE +4.82%, 2.4x volume surge crossing ₹1,500 threshold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1. RELIANCE Breakout</span>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={onApplyScenarioEarningsFall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
            title="TCS -3.8% earnings drop with elevated volume and volatility"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>2. TCS Gap Down</span>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={onApplyScenarioCalm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
            title="Calm market: all stocks within ±0.3% normal bounds"
          >
            <SunMedium className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Calm Session</span>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={() => onSetStatus(currentStatus === 'STALE' ? 'LIVE' : 'STALE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs ${
              currentStatus === 'STALE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle simulated stale provider data"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Stale Cache Test</span>
          </button>

          {/* Live Tick Sim */}
          <button
            onClick={onToggleLiveTicks}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs ${
              isSimulatingLiveTicks
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle simulated intraday tick stream"
          >
            {isSimulatingLiveTicks ? (
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isSimulatingLiveTicks ? 'Ticks: Live' : 'Ticks: Paused'}</span>
          </button>

          {/* Freeze Snapshot */}
          <button
            onClick={onFreezeSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Freeze current prices as your check-in baseline snapshot"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capture Snapshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
