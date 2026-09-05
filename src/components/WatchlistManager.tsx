import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  FolderPlus,
  X,
  Check,
  Layers,
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { Watchlist, Stock, AttentionAnalysis } from '../types/market';
import { marketProvider } from '../services/marketData';
import { Sparkline } from './Sparkline';
import { SessionReportModal } from './SessionReportModal';

interface WatchlistManagerProps {
  watchlists: Watchlist[];
  activeWatchlistId: string;
  onSelectWatchlist: (id: string) => void;
  onCreateWatchlist: (name: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onAddStockToWatchlist: (stockSymbol: string) => void;
  onRemoveStockFromWatchlist: (stockSymbol: string) => void;
  analyses: AttentionAnalysis[];
  onSelectStock: (stock: Stock) => void;
  lastSnapshotTime?: string | null;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  watchlists,
  activeWatchlistId,
  onSelectWatchlist,
  onCreateWatchlist,
  onDeleteWatchlist,
  onAddStockToWatchlist,
  onRemoveStockFromWatchlist,
  analyses,
  onSelectStock,
  lastSnapshotTime = null,
}) => {
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showCreateWlModal, setShowCreateWlModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newWlName, setNewWlName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'ATTENTION' | 'GAINERS' | 'LOSERS' | 'VOLUME' | 'SYMBOL'>('ATTENTION');
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [meaningfulOnly, setMeaningfulOnly] = useState(false);
  const [expandedNarratives, setExpandedNarratives] = useState<Record<string, boolean>>({});

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  const allStocks = marketProvider.getAllStocks();
  const availableSectors = ['ALL', ...Array.from(new Set(allStocks.map((s) => s.sector)))];

  // Sectors present in current active watchlist
  const watchlistSectors = useMemo(() => {
    const set = new Set<string>();
    analyses.forEach((a) => set.add(a.stock.sector));
    return ['ALL', ...Array.from(set)];
  }, [analyses]);

  // Filter & Sort Analyses
  const processedAnalyses = useMemo(() => {
    let list = [...analyses];

    // Sector filter
    if (activeSectorFilter !== 'ALL') {
      list = list.filter((a) => a.stock.sector === activeSectorFilter);
    }

    // Alerts only filter
    if (alertsOnly) {
      list = list.filter((a) => a.triggeredAlerts.length > 0);
    }

    // Meaningful change only
    if (meaningfulOnly) {
      list = list.filter((a) => a.hasMeaningfulChange);
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'ATTENTION':
          return b.currentScore - a.currentScore;
        case 'GAINERS':
          return b.signals.priceChangePct - a.signals.priceChangePct;
        case 'LOSERS':
          return a.signals.priceChangePct - b.signals.priceChangePct;
        case 'VOLUME':
          return b.signals.volumeRatio - a.signals.volumeRatio;
        case 'SYMBOL':
          return a.stock.symbol.localeCompare(b.stock.symbol);
        default:
          return b.currentScore - a.currentScore;
      }
    });

    return list;
  }, [analyses, activeSectorFilter, alertsOnly, meaningfulOnly, sortBy]);

  const filteredSearchStocks = allStocks.filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const isStockInActiveWatchlist = (symbol: string) => {
    return activeWatchlist?.stockSymbols.includes(symbol);
  };

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    onCreateWatchlist(newWlName.trim());
    setNewWlName('');
    setShowCreateWlModal(false);
  };

  const toggleNarrative = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNarratives((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const getAttentionPill = (score: number) => {
    if (score >= 80) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (score >= 35) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-8">
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Watchlist Universe & Portfolios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active tracking records synced with Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Generate Session Shift Report and Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shift Report & CSV</span>
          </button>

          <button
            onClick={() => setShowAddStockModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Ticker</span>
          </button>
        </div>
      </div>

      {/* Watchlist Tabs Bar */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          {watchlists.map((wl) => {
            const isActive = wl.id === activeWatchlist?.id;
            return (
              <button
                key={wl.id}
                onClick={() => {
                  onSelectWatchlist(wl.id);
                  setActiveSectorFilter('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{wl.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {wl.stockSymbols.length}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowCreateWlModal(true)}
            className="p-1.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
            title="Create New Watchlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {watchlists.length > 1 && activeWatchlist && (
          <button
            onClick={() => onDeleteWatchlist(activeWatchlist.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            title="Delete this watchlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Smart Filters, Sector Chips & Quick Sort Controls */}
      <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Sector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Sector:
          </span>
          {watchlistSectors.map((sector) => {
            const isSelected = activeSectorFilter === sector;
            return (
              <button
                key={sector}
                onClick={() => setActiveSectorFilter(sector)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>

        {/* Sorting & Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setAlertsOnly(!alertsOnly)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                alertsOnly
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alerts Only
            </button>
            <button
              onClick={() => setMeaningfulOnly(!meaningfulOnly)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                meaningfulOnly
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Score ≥ 35
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-[11px] text-slate-400 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 border-none rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ATTENTION">Attention (High → Low)</option>
              <option value="GAINERS">Top Gainers %</option>
              <option value="LOSERS">Top Losers %</option>
              <option value="VOLUME">Volume Surge</option>
              <option value="SYMBOL">Ticker (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sleek Table Layout with Sparkline & Intelligence Notes */}
      {processedAnalyses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Ticker / Company</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Trend (1D)</th>
                <th className="px-4 py-3">Attention Index</th>
                <th className="px-4 py-3">Volume Status</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Shift vs Base</th>
                <th className="px-4 py-3 text-center">Intelligence Note</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
              {processedAnalyses.map((analysis) => {
                const { stock, currentScore, signals, hasMeaningfulChange, triggeredAlerts, whyItMovedSummary } = analysis;
                const isPos = signals.priceChangePct >= 0;
                const baseline = analysis.previousSnapshot ? analysis.previousSnapshot.price : stock.previousClose;
                const isExpanded = !!expandedNarratives[stock.symbol];

                return (
                  <React.Fragment key={stock.symbol}>
                    <tr
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Ticker & Company */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {stock.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                                {stock.exchange}
                              </span>
                              {triggeredAlerts.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Alert
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-[150px]">
                              {stock.companyName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-500">
                        {stock.sector}
                      </td>

                      {/* Sparkline Column */}
                      <td className="px-4 py-3.5">
                        <Sparkline
                          data={stock.history['1D']}
                          currentPrice={stock.currentPrice}
                          baselinePrice={baseline}
                          width={95}
                          height={30}
                        />
                      </td>

                      {/* Attention Score */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getAttentionPill(currentScore)}`}>
                          {currentScore} / 100
                        </span>
                      </td>

                      {/* Volume Status */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              signals.volumeRatio >= 1.8 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-xs font-semibold text-slate-700">
                            {signals.volumeRatio}× normal
                          </span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* 24h / Baseline Change */}
                      <td className="px-5 py-3.5 text-right">
                        <span className={`font-semibold text-xs flex items-center justify-end ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                          {isPos ? '+' : ''}{signals.priceChangePct}%
                        </span>
                      </td>

                      {/* Automated "Why It Moved" Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => toggleNarrative(stock.symbol, e)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 mx-auto transition-colors cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : currentScore >= 60
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Click to view automated change rationale"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Why moved?</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveStockFromWatchlist(stock.symbol);
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Why It Moved Intelligence Card */}
                    {isExpanded && (
                      <tr className="bg-indigo-50/40 border-b border-indigo-100">
                        <td colSpan={9} className="px-6 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <span>Intelligence Synthesis: {stock.symbol}</span>
                                <span className="text-[10px] text-indigo-700 font-semibold px-2 py-0.2 bg-indigo-100/70 rounded">
                                  Attention Score {currentScore}/100
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                {whyItMovedSummary}
                              </p>
                              {analysis.explanationBullets.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {analysis.explanationBullets.map((bullet, i) => (
                                    <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center text-slate-400">
          <p className="text-sm">
            {analyses.length === 0
              ? 'No stocks in this watchlist.'
              : 'No stocks match the selected filter criteria.'}
          </p>
          {analyses.length > 0 ? (
            <button
              onClick={() => {
                setActiveSectorFilter('ALL');
                setAlertsOnly(false);
                setMeaningfulOnly(false);
              }}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => setShowAddStockModal(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          )}
        </div>
      )}

      {/* Table Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {processedAnalyses.length} of {analyses.length} symbols in {activeWatchlist?.name}
        </span>
        <button
          onClick={() => setShowAddStockModal(true)}
          className="text-indigo-600 text-xs font-bold hover:underline cursor-pointer"
        >
          + Add more symbols to watchlist
        </button>
      </div>

      {/* Add Stock Search Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Add Stocks to {activeWatchlist?.name}
              </h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input matching Sleek Theme */}
            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or company (e.g. RELIANCE, TCS)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                autoFocus
              />
            </div>

            {/* Sector filter pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {availableSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                    selectedSector === sector
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {filteredSearchStocks.map((stock) => {
                const alreadyAdded = isStockInActiveWatchlist(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{stock.symbol}</span>
                        <span className="text-[10px] text-slate-400">{stock.sector}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[220px]">
                        {stock.companyName}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs font-semibold text-slate-900">
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>

                      {alreadyAdded ? (
                        <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => onAddStockToWatchlist(stock.symbol)}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateWlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Watchlist</h3>
              <button
                onClick={() => setShowCreateWlModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWatchlist} className="mt-4">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Watchlist Name
              </label>
              <input
                type="text"
                value={newWlName}
                onChange={(e) => setNewWlName(e.target.value)}
                placeholder="e.g. Dividend Bluechips, Banking..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWlModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWlName.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Create Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Report Modal */}
      <SessionReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        analyses={analyses}
        activeWatchlist={activeWatchlist}
        lastSnapshotTime={lastSnapshotTime}
      />
    </section>
  );
};
