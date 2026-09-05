import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { AttentionAnalysis, Watchlist } from '../types/market';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyses: AttentionAnalysis[];
  activeWatchlist: Watchlist | null;
  lastSnapshotTime: string | null;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  analyses,
  activeWatchlist,
  lastSnapshotTime,
}) => {
  if (!isOpen) return null;

  const totalStocks = analyses.length;
  const gainers = analyses.filter((a) => a.signals.priceChangePct > 0).length;
  const losers = analyses.filter((a) => a.signals.priceChangePct < 0).length;
  const alertsFired = analyses.filter((a) => a.triggeredAlerts.length > 0).length;
  const highAttention = analyses.filter((a) => a.currentScore >= 60).length;

  const avgScore = totalStocks > 0 
    ? Math.round(analyses.reduce((acc, a) => acc + a.currentScore, 0) / totalStocks)
    : 0;

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = [
      'Symbol',
      'Company Name',
      'Sector',
      'Current Price (INR)',
      'Baseline Price (INR)',
      'Delta INR',
      'Delta Pct (%)',
      'Volume',
      'Volume Ratio (x)',
      'Attention Score (0-100)',
      'Severity',
      'Triggered Alerts Count',
      'Why It Moved Summary',
    ];

    const rows = analyses.map((a) => {
      const baseline = a.previousSnapshot ? a.previousSnapshot.price : a.stock.previousClose;
      const deltaPrice = a.stock.currentPrice - baseline;

      return [
        `"${a.stock.symbol}"`,
        `"${a.stock.companyName.replace(/"/g, '""')}"`,
        `"${a.stock.sector}"`,
        a.stock.currentPrice.toFixed(2),
        baseline.toFixed(2),
        deltaPrice.toFixed(2),
        a.signals.priceChangePct.toFixed(2),
        a.stock.volume,
        a.signals.volumeRatio.toFixed(2),
        a.currentScore,
        `"${a.severity}"`,
        a.triggeredAlerts.length,
        `"${(a.whyItMovedSummary || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MarketPulse_${activeWatchlist?.name.replace(/\s+/g, '_') || 'Portfolio'}_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                Market Intelligence Report
              </span>
              <span className="text-xs text-slate-400">
                Generated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {activeWatchlist?.name || 'Watchlist Universe'} Shift Audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis against baseline snapshot taken at {lastSnapshotTime ? new Date(lastSnapshotTime).toLocaleTimeString() : 'market open'}.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High Level Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5 flex-shrink-0">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Equities</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalStocks}</div>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Advance
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{gainers}</div>
          </div>
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
            <div className="text-[10px] uppercase font-bold text-rose-600 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Decline
            </div>
            <div className="text-xl font-bold text-rose-700 mt-0.5">{losers}</div>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Alerts Fired
            </div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{alertsFired}</div>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-indigo-600">Avg Attention</div>
            <div className="text-xl font-bold text-indigo-700 mt-0.5">{avgScore}/100</div>
          </div>
        </div>

        {/* Equities Narrative Breakdown */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Stock Analysis & Intelligence Notes:
          </div>

          <div className="space-y-3">
            {analyses.map((a) => {
              const isPos = a.signals.priceChangePct >= 0;
              const baseline = a.previousSnapshot ? a.previousSnapshot.price : a.stock.previousClose;
              const deltaINR = a.stock.currentPrice - baseline;

              return (
                <div 
                  key={a.stock.symbol}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-900 shadow-xs">
                        {a.stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {a.stock.symbol}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                            {a.stock.sector}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {a.stock.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          ₹{a.stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPos ? '+' : ''}{a.signals.priceChangePct}% (₹{deltaINR >= 0 ? '+' : ''}{deltaINR.toFixed(2)})
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        a.currentScore >= 60 
                          ? 'bg-rose-100 text-rose-800 border-rose-200' 
                          : a.currentScore >= 35 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}>
                        Score {a.currentScore}
                      </span>
                    </div>
                  </div>

                  {/* Why it moved story */}
                  <div className="mt-3 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    <div className="font-semibold text-slate-900 text-[11px] mb-0.5 flex items-center gap-1.5 text-indigo-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      Intelligence Note:
                    </div>
                    {a.whyItMovedSummary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span>MarketPulse Intelligence Engine • Indian Equities Real-Time</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
