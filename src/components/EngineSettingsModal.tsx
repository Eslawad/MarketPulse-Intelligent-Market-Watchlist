import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import { EngineWeights } from '../types/market';
import { DEFAULT_ENGINE_WEIGHTS } from '../services/changeEngine';

interface EngineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: EngineWeights;
  onSaveWeights: (weights: EngineWeights) => void;
}

export const EngineSettingsModal: React.FC<EngineSettingsModalProps> = ({
  isOpen,
  onClose,
  weights: initialWeights,
  onSaveWeights,
}) => {
  const [weights, setWeights] = useState<EngineWeights>(initialWeights);

  if (!isOpen) return null;

  const totalSum =
    weights.priceImpact +
    weights.volumeAnomaly +
    weights.thresholdCrossing +
    weights.relativeBenchmark +
    weights.volatilitySwing +
    weights.providerFreshness;

  const handleSliderChange = (key: keyof EngineWeights, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleReset = () => {
    setWeights(DEFAULT_ENGINE_WEIGHTS);
  };

  const applyPreset = (preset: 'DEFAULT' | 'MOMENTUM' | 'ALERTS_FIRST') => {
    if (preset === 'DEFAULT') {
      setWeights(DEFAULT_ENGINE_WEIGHTS);
    } else if (preset === 'MOMENTUM') {
      setWeights({
        priceImpact: 35,
        volumeAnomaly: 30,
        thresholdCrossing: 10,
        relativeBenchmark: 15,
        volatilitySwing: 5,
        providerFreshness: 5,
      });
    } else if (preset === 'ALERTS_FIRST') {
      setWeights({
        priceImpact: 15,
        volumeAnomaly: 15,
        thresholdCrossing: 40,
        relativeBenchmark: 10,
        volatilitySwing: 10,
        providerFreshness: 10,
      });
    }
  };

  const handleSave = () => {
    onSaveWeights(weights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                Attention Formula Configurator
              </h2>
              <p className="text-xs text-slate-500">
                Calibrate the mathematical weights governing the 0–100 Attention Index.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Formula Presets:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => applyPreset('DEFAULT')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('MOMENTUM')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Breakout Velocity
            </button>
            <button
              onClick={() => applyPreset('ALERTS_FIRST')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Alerts Priority
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {/* Price Velocity */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Price Velocity & Delta vs Baseline</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.priceImpact} pts ({Math.round((weights.priceImpact / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.priceImpact}
              onChange={(e) => handleSliderChange('priceImpact', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Higher weight elevates tickers making outsized % jumps or drops relative to snapshot.
            </p>
          </div>

          {/* Volume Anomaly */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Abnormal Volume Spike (vs 20D Avg)</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.volumeAnomaly} pts ({Math.round((weights.volumeAnomaly / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.volumeAnomaly}
              onChange={(e) => handleSliderChange('volumeAnomaly', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Surges beyond 1.5× to 3× typical trading volume.
            </p>
          </div>

          {/* Threshold Crossing */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>User Alert Rule Crossing</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.thresholdCrossing} pts ({Math.round((weights.thresholdCrossing / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.thresholdCrossing}
              onChange={(e) => handleSliderChange('thresholdCrossing', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Bonus awarded whenever a stock penetrates your active price targets or floor alerts.
            </p>
          </div>

          {/* Relative Benchmark Delta */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Relative Alpha / Lag vs NIFTY 50</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.relativeBenchmark} pts ({Math.round((weights.relativeBenchmark / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.relativeBenchmark}
              onChange={(e) => handleSliderChange('relativeBenchmark', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Divergence score measuring how far the stock separates from broader market direction.
            </p>
          </div>

          {/* Volatility Swing */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Intraday Range & Volatility Swing</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.volatilitySwing} pts ({Math.round((weights.volatilitySwing / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={weights.volatilitySwing}
              onChange={(e) => handleSliderChange('volatilitySwing', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Provider Freshness */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              <span>Feed Freshness Integrity</span>
              <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                {weights.providerFreshness} pts ({Math.round((weights.providerFreshness / totalSum) * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={weights.providerFreshness}
              onChange={(e) => handleSliderChange('providerFreshness', Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Apply Formula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
