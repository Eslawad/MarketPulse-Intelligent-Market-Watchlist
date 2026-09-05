import { Stock, Benchmark, MarketState, ProviderStatus, PricePoint } from '../types/market';

// Generate realistic intraday and historical price curves
function generateHistoricalPoints(
  basePrice: number,
  points: number,
  volatilityPct: number,
  trendPct: number,
  intervalLabel: (idx: number) => string
): PricePoint[] {
  const result: PricePoint[] = [];
  let current = basePrice * (1 - trendPct / 100);
  const stepTrend = (trendPct / 100) / points;

  for (let i = 0; i < points; i++) {
    const randomShock = (Math.random() - 0.48) * (volatilityPct / 100) * current;
    current = Math.max(1, current + current * stepTrend + randomShock);
    const volume = Math.round(10000 + Math.random() * 85000 + (Math.abs(randomShock) * 15000));
    result.push({
      time: intervalLabel(i),
      price: Number(current.toFixed(2)),
      volume,
    });
  }
  // Ensure last point aligns with basePrice
  if (result.length > 0) {
    result[result.length - 1].price = basePrice;
  }
  return result;
}

function generateHistoryForStock(price: number) {
  return {
    '1D': generateHistoricalPoints(price, 24, 0.4, 1.2, (i) => {
      const totalMinutes = 9 * 60 + 15 + i * 15; // 9:15 AM to 3:30 PM
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }),
    '1W': generateHistoricalPoints(price, 7, 1.2, 2.1, (i) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Today'];
      return days[i] || `D-${7 - i}`;
    }),
    '1M': generateHistoricalPoints(price, 22, 1.5, 3.5, (i) => `Day ${i + 1}`),
    '3M': generateHistoricalPoints(price, 36, 2.0, 5.0, (i) => `Wk ${i + 1}`),
    '1Y': generateHistoricalPoints(price, 52, 2.5, 14.0, (i) => `Wk ${i + 1}`),
  };
}

export const INITIAL_STOCKS: Stock[] = [
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    exchange: 'NSE',
    sector: 'Energy & Tech',
    currentPrice: 1504.20,
    previousClose: 1435.00,
    openPrice: 1448.00,
    highPrice: 1512.50,
    lowPrice: 1442.00,
    volume: 5240000,
    avgVolume20D: 2180000, // 2.4x volume surge
    high52W: 1610.00,
    low52W: 1180.00,
    peRatio: 26.4,
    marketCapCr: 2035000,
    history: generateHistoryForStock(1504.20),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'IT Services',
    currentPrice: 3421.50,
    previousClose: 3524.40,
    openPrice: 3500.00,
    highPrice: 3510.00,
    lowPrice: 3410.00,
    volume: 2450000,
    avgVolume20D: 1440000, // 1.7x volume
    high52W: 4250.00,
    low52W: 3310.00,
    peRatio: 28.2,
    marketCapCr: 1245000,
    history: generateHistoryForStock(3421.50),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    exchange: 'NSE',
    sector: 'IT Services',
    currentPrice: 1782.10,
    previousClose: 1766.00,
    openPrice: 1770.00,
    highPrice: 1794.00,
    lowPrice: 1764.00,
    volume: 3890000,
    avgVolume20D: 3820000, // ~1.0x volume (Calm)
    high52W: 1980.00,
    low52W: 1358.00,
    peRatio: 27.1,
    marketCapCr: 742000,
    history: generateHistoryForStock(1782.10),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    exchange: 'NSE',
    sector: 'Banking & Financials',
    currentPrice: 1924.30,
    previousClose: 1869.40,
    openPrice: 1880.00,
    highPrice: 1932.00,
    lowPrice: 1878.00,
    volume: 8120000,
    avgVolume20D: 4900000, // 1.65x volume
    high52W: 1940.00,
    low52W: 1363.00,
    peRatio: 19.8,
    marketCapCr: 1460000,
    history: generateHistoryForStock(1924.30),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Limited',
    exchange: 'NSE',
    sector: 'Banking & Financials',
    currentPrice: 1248.80,
    previousClose: 1244.00,
    openPrice: 1247.00,
    highPrice: 1255.00,
    lowPrice: 1242.00,
    volume: 5120000,
    avgVolume20D: 5300000, // 0.96x volume (Calm)
    high52W: 1315.00,
    low52W: 980.00,
    peRatio: 17.5,
    marketCapCr: 878000,
    history: generateHistoryForStock(1248.80),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    exchange: 'NSE',
    sector: 'Automobile',
    currentPrice: 786.40,
    previousClose: 772.00,
    openPrice: 775.00,
    highPrice: 792.00,
    lowPrice: 771.50,
    volume: 9840000,
    avgVolume20D: 6200000, // 1.58x volume
    high52W: 1179.00,
    low52W: 680.00,
    peRatio: 9.8,
    marketCapCr: 289000,
    history: generateHistoryForStock(786.40),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Limited',
    exchange: 'NSE',
    sector: 'Telecommunications',
    currentPrice: 1632.00,
    previousClose: 1625.50,
    openPrice: 1628.00,
    highPrice: 1640.00,
    lowPrice: 1622.00,
    volume: 2400000,
    avgVolume20D: 2500000, // 0.96x volume (Calm)
    high52W: 1720.00,
    low52W: 1100.00,
    peRatio: 42.0,
    marketCapCr: 970000,
    history: generateHistoryForStock(1632.00),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'ITC',
    companyName: 'ITC Limited',
    exchange: 'NSE',
    sector: 'Consumer Goods (FMCG)',
    currentPrice: 442.15,
    previousClose: 440.80,
    openPrice: 441.50,
    highPrice: 444.00,
    lowPrice: 439.50,
    volume: 7200000,
    avgVolume20D: 7800000, // Calm
    high52W: 528.00,
    low52W: 399.00,
    peRatio: 25.4,
    marketCapCr: 552000,
    history: generateHistoryForStock(442.15),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'WIPRO',
    companyName: 'Wipro Limited',
    exchange: 'NSE',
    sector: 'IT Services',
    currentPrice: 498.60,
    previousClose: 504.20,
    openPrice: 502.00,
    highPrice: 505.00,
    lowPrice: 495.00,
    volume: 3100000,
    avgVolume20D: 2900000,
    high52W: 580.00,
    low52W: 415.00,
    peRatio: 21.0,
    marketCapCr: 261000,
    history: generateHistoryForStock(498.60),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'BAJFINANCE',
    companyName: 'Bajaj Finance Limited',
    exchange: 'NSE',
    sector: 'Banking & Financials',
    currentPrice: 6890.00,
    previousClose: 6850.00,
    openPrice: 6870.00,
    highPrice: 6940.00,
    lowPrice: 6835.00,
    volume: 820000,
    avgVolume20D: 850000,
    high52W: 7890.00,
    low52W: 6100.00,
    peRatio: 29.5,
    marketCapCr: 426000,
    history: generateHistoryForStock(6890.00),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'LT',
    companyName: 'Larsen & Toubro Limited',
    exchange: 'NSE',
    sector: 'Infrastructure & Capital Goods',
    currentPrice: 3560.00,
    previousClose: 3540.00,
    openPrice: 3545.00,
    highPrice: 3585.00,
    lowPrice: 3530.00,
    volume: 1150000,
    avgVolume20D: 1200000,
    high52W: 3900.00,
    low52W: 3100.00,
    peRatio: 33.2,
    marketCapCr: 489000,
    history: generateHistoryForStock(3560.00),
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: 'SUNPHARMA',
    companyName: 'Sun Pharmaceutical Industries',
    exchange: 'NSE',
    sector: 'Healthcare & Pharma',
    currentPrice: 1710.00,
    previousClose: 1705.00,
    openPrice: 1708.00,
    highPrice: 1722.00,
    lowPrice: 1701.00,
    volume: 1420000,
    avgVolume20D: 1480000,
    high52W: 1960.00,
    low52W: 1320.00,
    peRatio: 36.4,
    marketCapCr: 410000,
    history: generateHistoryForStock(1710.00),
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_BENCHMARKS: { nifty: Benchmark; sensex: Benchmark } = {
  nifty: {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    currentPrice: 22485.40,
    change: 182.60,
    changePercent: 0.82,
  },
  sensex: {
    symbol: 'SENSEX',
    name: 'BSE SENSEX Index',
    currentPrice: 73920.80,
    change: 558.20,
    changePercent: 0.76,
  },
};

export interface MarketDataProvider {
  getQuotes(symbols: string[]): Promise<Stock[]>;
  getQuote(symbol: string): Promise<Stock | null>;
  getBenchmarks(): Promise<{ nifty: Benchmark; sensex: Benchmark }>;
  getStatus(): ProviderStatus;
  setStatus(status: ProviderStatus): void;
}

// In-Memory Cached Demo Provider with Scenario Simulation Capabilities
class ResilientMarketDataProvider implements MarketDataProvider {
  private stocks: Map<string, Stock> = new Map();
  private nifty: Benchmark = { ...INITIAL_BENCHMARKS.nifty };
  private sensex: Benchmark = { ...INITIAL_BENCHMARKS.sensex };
  private status: ProviderStatus = 'LIVE';
  private cachedAt: string = new Date().toISOString();
  private latencyMs: number = 32;

  constructor() {
    INITIAL_STOCKS.forEach((s) => this.stocks.set(s.symbol, { ...s }));
  }

  getStatus(): ProviderStatus {
    return this.status;
  }

  setStatus(status: ProviderStatus): void {
    this.status = status;
    if (status === 'STALE') {
      // Simulate timestamp frozen 35 minutes ago
      const thirtyFiveMinAgo = new Date(Date.now() - 35 * 60 * 1000);
      this.cachedAt = thirtyFiveMinAgo.toISOString();
    } else {
      this.cachedAt = new Date().toISOString();
    }
  }

  getMarketState(): MarketState {
    return {
      providerStatus: this.status,
      lastUpdated: this.cachedAt,
      benchmarkNifty: { ...this.nifty },
      benchmarkSensex: { ...this.sensex },
      dataSource: this.status === 'LIVE' ? 'NSE Real-Time Stream (Direct)' : 'Cached Fallback Snapshot',
      latencyMs: this.latencyMs,
    };
  }

  async getQuotes(symbols: string[]): Promise<Stock[]> {
    return symbols.map((sym) => this.stocks.get(sym)).filter((s): s is Stock => Boolean(s));
  }

  async getQuote(symbol: string): Promise<Stock | null> {
    return this.stocks.get(symbol) || null;
  }

  async getBenchmarks(): Promise<{ nifty: Benchmark; sensex: Benchmark }> {
    return {
      nifty: { ...this.nifty },
      sensex: { ...this.sensex },
    };
  }

  getAllStocks(): Stock[] {
    return Array.from(this.stocks.values());
  }

  // Scenario 1: Volume Breakout & Threshold crossing on RELIANCE
  applyScenarioBreakout(): void {
    const r = this.stocks.get('RELIANCE');
    if (r) {
      r.currentPrice = 1504.20;
      r.previousClose = 1435.00;
      r.volume = 5240000;
      r.avgVolume20D = 2180000;
      r.lastUpdated = new Date().toISOString();
      r.history = generateHistoryForStock(r.currentPrice);
    }
    const h = this.stocks.get('HDFCBANK');
    if (h) {
      h.currentPrice = 1924.30;
      h.previousClose = 1869.40;
      h.volume = 8120000;
      h.avgVolume20D = 4900000;
      h.lastUpdated = new Date().toISOString();
    }
    this.setStatus('LIVE');
  }

  // Scenario 2: Earnings sell-off gap down on TCS with high volatility
  applyScenarioEarningsFall(): void {
    const tcs = this.stocks.get('TCS');
    if (tcs) {
      tcs.currentPrice = 3380.00;
      tcs.previousClose = 3524.40;
      tcs.openPrice = 3410.00;
      tcs.volume = 4100000;
      tcs.avgVolume20D = 1440000; // 2.85x volume
      tcs.lastUpdated = new Date().toISOString();
      tcs.history = generateHistoryForStock(3380.00);
    }
    this.setStatus('LIVE');
  }

  // Scenario 3: Calm session - minimal price & volume movements
  applyScenarioCalm(): void {
    this.stocks.forEach((s) => {
      s.currentPrice = Number((s.previousClose * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2));
      s.volume = Math.round(s.avgVolume20D * (0.85 + Math.random() * 0.25));
      s.lastUpdated = new Date().toISOString();
    });
    this.setStatus('LIVE');
  }

  // Random gentle market tick update (simulating intraday tick stream)
  simulateLiveTick(): void {
    if (this.status === 'UNAVAILABLE' || this.status === 'STALE') return;
    
    // Pick 2 random stocks to fluctuate slightly
    const keys = Array.from(this.stocks.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const stock = this.stocks.get(randomKey);
    if (stock) {
      const deltaPercent = (Math.random() - 0.49) * 0.002;
      const newPrice = Number((stock.currentPrice * (1 + deltaPercent)).toFixed(2));
      stock.currentPrice = newPrice;
      stock.volume += Math.round(500 + Math.random() * 2500);
      stock.highPrice = Math.max(stock.highPrice, newPrice);
      stock.lowPrice = Math.min(stock.lowPrice, newPrice);
      stock.lastUpdated = new Date().toISOString();
      this.cachedAt = new Date().toISOString();
    }
  }
}

export const marketProvider = new ResilientMarketDataProvider();
