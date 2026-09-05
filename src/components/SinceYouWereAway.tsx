import React, { useState } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  SlidersHorizontal,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Server
} from 'lucide-react';
import { AttentionAnalysis, Stock } from '../types/market';

interface SinceYouWereAwayProps {
  analyses: AttentionAnalysis[];
  lastSnapshotTime: string | null;
  onSelectStock: (stock: Stock) => void;
  onUpdateSnapshot: () => void;
}

export const SinceYouWereAway: React.FC<SinceYouWereAwayProps> = ({
  analyses,
  lastSnapshotTime,
  onSelectStock,
  onUpdateSnapshot,
}) => {
  const [showCalmStocks, setShowCalmStocks] = useState(false);

  // Partition analyses into priority attention vs calm
  const attentionRequired = analyses.filter((a) => a.hasMeaningfulChange);
  const calmStocks = analyses.filter((a) => !a.hasMeaningfulChange);

  // Highest attention score
  const maxScore = analyses.length > 0 ? Math.max(...analyses.map((a) => a.currentScore)) : 0;
  const topMover = analyses.find((a) => a.currentScore === maxScore);

  const formatSnapshotTime = (iso: string | null) => {
    if (!iso) return 'Recent check-in';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent check-in';
    }
  };

  const getSeverityBadge = (severity: string, score: number) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          text: 'Critical Attention',
        };
      case 'HIGH':
        return {
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          text: 'High Attention',
        };
      case 'MODERATE':
        return {
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          text: 'Moderate Shift',
        };
      default:
        return {
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          text: 'Calm',
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* 3 Sleek Overview Metric Cards matching the Sleek Interface Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Stocks Needing Attention</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">
            {attentionRequired.length}
          </p>
          <p className="text-rose-600 text-xs mt-2 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
            {attentionRequired.length > 0 ? 'Actionable Signals Triggered' : 'All Watched Stocks Calm'}
            <span className="text-slate-400 font-normal ml-1">since {formatSnapshotTime(lastSnapshotTime)}</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Highest Attention Index</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">
            {maxScore} <span className="text-lg font-normal text-slate-400">/ 100</span>
          </p>
          <p className="text-indigo-600 text-xs mt-2 font-bold">
            {topMover ? `${topMover.stock.symbol} — ${topMover.primaryReason}` : 'Watching market stream'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Database Latency & Sync</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">14ms</p>
          <p className="text-slate-400 text-xs mt-2 flex items-center justify-between">
            <span>Region: <strong className="text-slate-700">asia-southeast1</strong></span>
            <span className="text-emerald-600 font-bold">Firestore ABAC Enforced</span>
          </p>
        </div>
      </div>

      {/* Main "Since You Were Away" Container */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Since You Were Away
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating watched tickers against snapshot from <strong className="text-slate-700">{formatSnapshotTime(lastSnapshotTime)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Evaluation Active
            </span>

            <button
              onClick={onUpdateSnapshot}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset baseline to current prices"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Update Baseline</span>
            </button>
          </div>
        </div>

        {/* Attention Required Stock Cards */}
        {attentionRequired.length > 0 ? (
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {attentionRequired.map((analysis) => {
              const { stock, currentScore, severity, signals, primaryReason, explanationBullets } = analysis;
              const badge = getSeverityBadge(severity, currentScore);
              const isPositive = signals.priceChangePct >= 0;

              return (
                <div
                  key={stock.symbol}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 p-5 transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => onSelectStock(stock)}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shadow-xs">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {stock.symbol}
                            </h3>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-white border border-slate-200">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {stock.companyName}
                          </p>
                        </div>
                      </div>

                      {/* Attention Score Pill */}
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.text}</span>
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white font-black text-[11px]">
                            {currentScore}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Primary Highlight Pill */}
                    <div className="mt-3.5 px-3 py-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-800 truncate">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{primaryReason}</span>
                      </div>
                      <div className="font-bold shrink-0 flex items-center gap-1">
                        <span className="text-slate-900">
                          ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-xs font-semibold flex items-center ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {isPositive ? '+' : ''}{signals.priceChangePct}%
                        </span>
                      </div>
                    </div>

                    {/* Explanation Bullets */}
                    <div className="mt-3 space-y-1.5">
                      {explanationBullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Volume: <strong className="text-slate-700">{signals.volumeRatio}×</strong></span>
                      <span>•</span>
                      <span>
                        vs NIFTY:{' '}
                        <strong className={signals.relativeBenchmarkDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {signals.relativeBenchmarkDelta >= 0 ? '+' : ''}{signals.relativeBenchmarkDelta}%
                        </strong>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Nothing Critical Has Changed</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All stocks in this watchlist are currently moving within expected historical parameters relative to your baseline snapshot.
            </p>
          </div>
        )}

        {/* Calm Stocks Collapsible Drawer */}
        {calmStocks.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {calmStocks.length} Normal & Calm {calmStocks.length === 1 ? 'Ticker' : 'Tickers'}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Within ±0.3% price bounds, normal trading volume)
                </span>
              </div>

              <button
                onClick={() => setShowCalmStocks(!showCalmStocks)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>{showCalmStocks ? 'Hide' : 'Review Calm Stocks'}</span>
                {showCalmStocks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showCalmStocks && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                {calmStocks.map((analysis) => {
                  const { stock, signals } = analysis;
                  const isPositive = signals.priceChangePct >= 0;
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{stock.symbol}</span>
                          <span className="text-[10px] text-slate-400">{stock.sector}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                          {stock.companyName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900">
                          ₹{stock.currentPrice.toFixed(2)}
                        </div>
                        <div className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}{signals.priceChangePct}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
