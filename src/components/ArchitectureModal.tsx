import React from 'react';
import { X, ShieldCheck, Cpu, Database, Network, CheckCircle2, Zap } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                MarketPulse Architecture & Engineering Blueprint
              </h3>
              <p className="text-xs text-slate-500">
                Code by Groww 2026 Submission Specifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* 1. The Core Philosophy */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              1. The Core Problem: "What Changed, and Why Does It Matter?"
            </h4>
            <p className="text-slate-600">
              Traditional market watchlists flood investors with dozens of fluctuating green and red numbers, forcing manual scanning of every symbol. 
              <strong> MarketPulse</strong> fundamentally shifts from static display to <em>prioritized explanation</em> by comparing current market ticks against a persistent user baseline snapshot.
            </p>
          </div>

          {/* 2. Deterministic Attention Score Formula */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              2. Attention Score Formula (0–100)
            </h4>
            <p className="text-slate-600 mb-3">
              Instead of relying on an opaque, hallucination-prone LLM, MarketPulse calculates a strictly deterministic weighted score:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">Price Delta:</span> 25% (0-25 pts)
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">Volume Surge:</span> 20% (0-20 pts)
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">User Target:</span> 20% (0-20 pts)
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">vs NIFTY 50:</span> 15% (0-15 pts)
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">Volatility:</span> 10% (0-10 pts)
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="font-bold text-indigo-600">Data Quality:</span> 10% (0-10 pts)
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">80–100: CRITICAL</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">60–79: HIGH</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">35–59: MODERATE</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">0–34: CALM</span>
            </div>
          </div>

          {/* 3. Snapshot System Architecture */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-indigo-600" />
              3. Snapshot Lifecycle & Persistence
            </h4>
            <p className="text-slate-600">
              When a user inspects their watchlist or explicitly captures a baseline, the system records <code className="bg-slate-100 px-1 py-0.5 rounded">price</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">volume</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded">capturedAt</code> in Firebase Firestore under <code className="bg-slate-100 px-1 py-0.5 rounded">/users/{'{userId}'}/snapshots/{'{symbol}'}</code>.
              On subsequent visits, the Meaningful Change Engine queries this snapshot to detect volume spikes (e.g. 2.4× 20-day avg), gap openings, and crossed targets.
            </p>
          </div>

          {/* 4. Resilient Provider Abstraction */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-indigo-600" />
              4. Data Feed Reliability & Graceful Degradation
            </h4>
            <p className="text-slate-600">
              External market feeds inevitably suffer from rate limits, timeouts, or delayed closes. MarketPulse explicitly implements four states:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
              <li><strong>LIVE:</strong> Sub-second real-time streaming feed with latency tracking.</li>
              <li><strong>DELAYED:</strong> 15-minute standard exchange latency, explicitly labeled.</li>
              <li><strong>STALE:</strong> Fallback when providers freeze. The UI displays an unambiguous alert indicating the snapshot is from a specific verified time.</li>
              <li><strong>UNAVAILABLE:</strong> Graceful fallback to deterministic cached snapshots without throwing 500 crashes.</li>
            </ul>
          </div>

          {/* 5. Security & Zero-Trust ABAC */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              5. Firestore ABAC Security Rules
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Every single user's watchlists, snapshots, alerts, and change events are strictly isolated using Firebase Auth UID scoping (<code className="bg-white/80 px-1 py-0.5 rounded">request.auth.uid == userId</code>). 
              No user can ever query or modify another user's financial watchlists or private alert thresholds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
