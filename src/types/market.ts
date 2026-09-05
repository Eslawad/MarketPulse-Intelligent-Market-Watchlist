export type AttentionSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';

export type ProviderStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  currentPrice: number;
  previousClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  avgVolume20D: number;
  high52W: number;
  low52W: number;
  peRatio: number;
  marketCapCr: number;
  history: {
    '1D': PricePoint[];
    '1W': PricePoint[];
    '1M': PricePoint[];
    '3M': PricePoint[];
    '1Y': PricePoint[];
  };
  lastUpdated: string;
}

export interface Benchmark {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export interface UserSnapshot {
  id: string;
  userId: string;
  stockSymbol: string;
  price: number;
  volume: number;
  attentionScore: number;
  capturedAt: string; // ISO string
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  stockSymbols: string[];
  createdAt: string;
  updatedAt: string;
}

export type AlertRuleType =
  | 'PRICE_ABOVE'
  | 'PRICE_BELOW'
  | 'PCT_CHANGE_ABOVE'
  | 'PCT_CHANGE_BELOW'
  | 'VOLUME_SURGE'
  | 'ATTENTION_HIGH';

export interface AlertRule {
  id: string;
  userId: string;
  stockSymbol: string;
  ruleType: AlertRuleType;
  threshold: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeEvent {
  id: string;
  userId: string;
  stockSymbol: string;
  eventType: string;
  severity: AttentionSeverity;
  score: number;
  explanation: string;
  beforeValue: number;
  afterValue: number;
  createdAt: string;
}

export interface SignalBreakdown {
  priceChangePct: number;
  priceImpactScore: number; // 0-25
  volumeRatio: number;
  volumeScore: number; // 0-20
  thresholdCrossed: boolean;
  thresholdScore: number; // 0-20
  thresholdDetail?: string;
  relativeBenchmarkDelta: number;
  relativeScore: number; // 0-15
  volatilityRatio: number;
  volatilityScore: number; // 0-10
  gapPct: number;
  freshnessScore: number; // 0-10
}

export interface AttentionAnalysis {
  stock: Stock;
  previousSnapshot: UserSnapshot | null;
  currentScore: number; // 0-100
  severity: AttentionSeverity;
  hasMeaningfulChange: boolean;
  primaryReason: string;
  whyItMovedSummary: string; // Synthesized natural language intelligence explanation
  explanationBullets: string[];
  signals: SignalBreakdown;
  triggeredAlerts: AlertRule[];
  timeline: {
    time: string;
    type: string;
    description: string;
    severity: AttentionSeverity;
  }[];
}

export interface MarketState {
  providerStatus: ProviderStatus;
  lastUpdated: string;
  benchmarkNifty: Benchmark;
  benchmarkSensex: Benchmark;
  dataSource: string;
  latencyMs: number;
}

export interface EngineWeights {
  priceImpact: number; // default 25
  volumeAnomaly: number; // default 20
  thresholdCrossing: number; // default 20
  relativeBenchmark: number; // default 15
  volatilitySwing: number; // default 10
  providerFreshness: number; // default 10
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  stockSymbol: string;
  type: string;
  message: string;
  severity: AttentionSeverity;
  score: number;
  read: boolean;
}
