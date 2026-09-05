import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  X,
  ToggleLeft,
  ToggleRight,
  ShieldAlert
} from 'lucide-react';
import { AlertRule, AlertRuleType, AttentionAnalysis } from '../types/market';
import { marketProvider } from '../services/marketData';

interface AlertsManagerProps {
  alerts: AlertRule[];
  onToggleAlert: (alert: AlertRule) => void;
  onDeleteAlert: (alertId: string) => void;
  onAddAlert: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  analyses: AttentionAnalysis[];
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  onToggleAlert,
  onDeleteAlert,
  onAddAlert,
  analyses,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('RELIANCE');
  const [ruleType, setRuleType] = useState<AlertRuleType>('PRICE_ABOVE');
  const [threshold, setThreshold] = useState<string>('1500');

  const allStocks = marketProvider.getAllStocks();

  // Find system-detected events triggered right now
  const triggeredEvents = analyses.filter((a) => a.hasMeaningfulChange);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(threshold);
    if (isNaN(val)) return;

    onAddAlert({
      userId: 'active_user',
      stockSymbol,
      ruleType,
      threshold: val,
      enabled: true,
    });
    setShowModal(false);
  };

  const getRuleLabel = (type: AlertRuleType, val: number) => {
    switch (type) {
      case 'PRICE_ABOVE':
        return `Price crosses above ₹${val.toLocaleString('en-IN')}`;
      case 'PRICE_BELOW':
        return `Price crosses below ₹${val.toLocaleString('en-IN')}`;
      case 'PCT_CHANGE_ABOVE':
        return `Movement exceeds +${val}%`;
      case 'PCT_CHANGE_BELOW':
        return `Movement drops past -${val}%`;
      case 'VOLUME_SURGE':
        return `Volume exceeds ${val}× 20-day average`;
      case 'ATTENTION_HIGH':
        return `Attention Score reaches ${val}+`;
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-8">
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Alert Rules & Deterministic Triggers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicit separation between user-configured rules and system anomalies.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Alert Rule</span>
        </button>
      </div>

      {/* Two columns: 1. User Defined Rules vs 2. System Detected Meaningful Events */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/40">
        {/* Left: User Defined Rules */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
              <span>Your Custom Alert Rules</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {alerts.length}
              </span>
            </h4>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {alert.stockSymbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 bg-slate-100 rounded">
                        User Rule
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1 font-medium">
                      {getRuleLabel(alert.ruleType, alert.threshold)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleAlert(alert)}
                      className={`text-sm cursor-pointer transition-colors ${
                        alert.enabled ? 'text-indigo-600' : 'text-slate-300'
                      }`}
                      title={alert.enabled ? 'Disable Alert' : 'Enable Alert'}
                    >
                      {alert.enabled ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-xs">No custom alert rules configured yet.</p>
            </div>
          )}
        </div>

        {/* Right: System Detected Anomalies (Active Right Now) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
              <span>System-Detected Anomaly Events</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                {triggeredEvents.length} Active
              </span>
            </h4>
          </div>

          {triggeredEvents.length > 0 ? (
            <div className="space-y-2.5">
              {triggeredEvents.map((event) => (
                <div
                  key={event.stock.symbol}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {event.stock.symbol}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          event.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : event.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.severity} ({event.currentScore})
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-900">
                      ₹{event.stock.currentPrice.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {event.primaryReason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-xs">No active anomalies detected in current tick.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Alert Rule</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Stock
                </label>
                <select
                  value={stockSymbol}
                  onChange={(e) => {
                    setStockSymbol(e.target.value);
                    const selected = allStocks.find((s) => s.symbol === e.target.value);
                    if (selected) {
                      setThreshold(String(Math.round(selected.currentPrice * 1.03)));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  {allStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.companyName} (₹{s.currentPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Trigger Condition
                </label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as AlertRuleType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="PRICE_ABOVE">Price Crosses Above ₹ Target</option>
                  <option value="PRICE_BELOW">Price Crosses Below ₹ Floor</option>
                  <option value="PCT_CHANGE_ABOVE">Movement Exceeds +%</option>
                  <option value="PCT_CHANGE_BELOW">Movement Drops Past -%</option>
                  <option value="VOLUME_SURGE">Volume Exceeds Multiple (e.g. 2.0×)</option>
                  <option value="ATTENTION_HIGH">Attention Score Reaches (0-100)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Threshold Target Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
