import React from 'react';
import { 
  X, 
  Bell, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { NotificationItem, AttentionSeverity } from '../types/market';
import { soundService } from '../services/sound';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
  onSelectStock: (symbol: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onSelectStock,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  const getSeverityIcon = (severity: AttentionSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'MODERATE':
        return <Activity className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity: AttentionSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                Alert Event Stream
                {notifications.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {notifications.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Live trigger history & anomaly radar</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title={isMuted ? 'Sound muted (click to unmute)' : 'Alert audio chimes enabled'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{notifications.length} events logged in session</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-400" />
              </div>
              <div className="font-semibold text-slate-600 text-sm">No Active Alert Crossings</div>
              <div className="text-xs text-slate-400 mt-1 max-w-[240px]">
                When stock prices cross your alert floors, price targets, or 2× volume triggers, they appear here with auditory alerts.
              </div>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectStock(item.stockSymbol);
                  onClose();
                }}
                className="py-3.5 px-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(item.severity)}
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.stockSymbol}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.message}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">
                    Attention Score: <strong className="text-slate-700">{item.score}/100</strong>
                  </span>
                  <span className="text-indigo-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect Chart <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Audio synthesizer pings on newly detected anomaly crossovers
        </div>
      </div>
    </div>
  );
};
