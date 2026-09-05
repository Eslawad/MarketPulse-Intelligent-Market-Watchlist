import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Clock, 
  Sliders, 
  Check, 
  Info,
  Shield,
  Activity,
  Plus
} from 'lucide-react';
import { Stock, AttentionAnalysis, AlertRuleType, AlertRule } from '../types/market';

interface StockDetailModalProps {
  stock: Stock;
  analysis: AttentionAnalysis;
  onClose: () => void;
  onAddAlert: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  analysis,
  onClose,
  onAddAlert,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{ time: string; price: number } | null>(null);

  // Alert configuration state
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [alertType, setAlertType] = useState<AlertRuleType>('PRICE_ABOVE');
  const [alertThreshold, setAlertThreshold] = useState<string>(String(Math.round(stock.currentPrice * 1.03)));

  const chartData = stock.history[timeframe] || stock.history['1D'];

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const isPositive = analysis.signals.priceChangePct >= 0;

  // Compute SVG chart path
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 20;
  const paddingY = 25;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1 || 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - ((d.price - minPrice) / priceRange) * (svgHeight - 2 * paddingY);
    return { x, y, data: d };
  });

  const pathString = points.reduce((acc, pt, index) => {
    return index === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaString = `${pathString} L ${points[points.length - 1]?.x || svgWidth - paddingX},${svgHeight - paddingY} L ${points[0]?.x || paddingX},${svgHeight - paddingY} Z`;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdNum = parseFloat(alertThreshold);
    if (isNaN(thresholdNum)) return;

    onAddAlert({
      userId: 'active_user',
      stockSymbol: stock.symbol,
      ruleType: alertType,
      threshold: thresholdNum,
      enabled: true,
    });
    setShowAddAlert(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-sm">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  {stock.symbol}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  {stock.exchange}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-500">{stock.companyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddAlert(!showAddAlert)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Price & Attention Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Current Market Price
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-sm font-bold flex items-center ${
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-0.5" /> : <TrendingDown className="w-4 h-4 mr-0.5" />}
                  {isPositive ? '+' : ''}{analysis.signals.priceChangePct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prev Close: ₹{stock.previousClose.toFixed(2)} | Day High: ₹{stock.highPrice.toFixed(2)} | Low: ₹{stock.lowPrice.toFixed(2)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Attention Score
              </div>
              <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {analysis.currentScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    analysis.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : analysis.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {analysis.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {analysis.primaryReason}
              </p>
            </div>
          </div>

          {/* Inline Alert Rule Form */}
          {showAddAlert && (
            <form
              onSubmit={handleCreateAlert}
              className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <span>Configure Alert Rule for {stock.symbol}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddAlert(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-700"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                    Trigger Condition
                  </label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as AlertRuleType)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800"
                  >
                    <option value="PRICE_ABOVE">Price Crosses Above ₹</option>
                    <option value="PRICE_BELOW">Price Crosses Below ₹</option>
                    <option value="PCT_CHANGE_ABOVE">% Move Exceeds +%</option>
                    <option value="PCT_CHANGE_BELOW">% Move Drops Past -%</option>
                    <option value="VOLUME_SURGE">Volume Exceeds Multiple (e.g. 2.0×)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                    Target Threshold Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    placeholder="Enter threshold..."
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          )}

          {/* Interactive Chart Container */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-800">
                Price Trajectory
                {hoveredPoint && (
                  <span className="ml-2 font-mono text-indigo-600">
                    ₹{hoveredPoint.price.toFixed(2)} at {hoveredPoint.time}
                  </span>
                )}
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Chart */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-56 overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Filled Area */}
                <path d={areaString} fill="url(#chartGradient)" />

                {/* Main Line */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover dots & trigger targets */}
                {points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.time === pt.data.time ? 5 : 2}
                    fill={isPositive ? '#10b981' : '#f43f5e'}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint({ time: pt.data.time, price: pt.data.price })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 px-2">
                <span>Low: ₹{minPrice.toFixed(2)}</span>
                <span>High: ₹{maxPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Meaningful Change Engine Signal Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Deterministic Signal Breakdown</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Price Movement</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.priceImpactScore} / 25
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Delta: {analysis.signals.priceChangePct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Volume Anomaly</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.volumeScore} / 20
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Ratio: {analysis.signals.volumeRatio}× normal
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">User Thresholds</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.thresholdScore} / 20
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {analysis.signals.thresholdCrossed ? 'Triggered' : 'Normal bounds'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">vs Benchmark</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.relativeScore} / 15
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Relative: {analysis.signals.relativeBenchmarkDelta >= 0 ? '+' : ''}{analysis.signals.relativeBenchmarkDelta}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Volatility Anomaly</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.volatilityScore} / 10
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Intraday swing
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Data Freshness</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {analysis.signals.freshnessScore} / 10
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Feed reliability
                </div>
              </div>
            </div>
          </div>

          {/* Intraday Audit Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>What Changed? Intraday Timeline</span>
            </h4>

            <div className="border-l-2 border-slate-200 pl-4 space-y-4">
              {analysis.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {event.time}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Fundamental Stats Grid */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Key Fundamentals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[11px]">Market Cap</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  ₹{(stock.marketCapCr / 1000).toFixed(1)}k Cr
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[11px]">P/E Ratio</div>
                <div className="font-bold text-slate-800 mt-0.5">{stock.peRatio}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[11px]">52-Week High</div>
                <div className="font-bold text-slate-800 mt-0.5">₹{stock.high52W.toFixed(2)}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-400 text-[11px]">52-Week Low</div>
                <div className="font-bold text-slate-800 mt-0.5">₹{stock.low52W.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
