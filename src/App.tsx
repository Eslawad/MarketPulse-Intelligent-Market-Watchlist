import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  subscribeToAuthState, 
  loginWithGoogle, 
  logoutUser, 
  testFirestoreConnection 
} from './services/firebase';
import { marketProvider } from './services/marketData';
import { changeEngine } from './services/changeEngine';
import { StorageRepository } from './services/dbSync';
import { 
  Stock, 
  Watchlist, 
  UserSnapshot, 
  AlertRule, 
  AttentionAnalysis, 
  ProviderStatus,
  MarketState,
  EngineWeights,
  NotificationItem
} from './types/market';
import { soundService } from './services/sound';
import { DEFAULT_ENGINE_WEIGHTS } from './services/changeEngine';
import { Header } from './components/Header';
import { SinceYouWereAway } from './components/SinceYouWereAway';
import { WatchlistManager } from './components/WatchlistManager';
import { StockDetailModal } from './components/StockDetailModal';
import { AlertsManager } from './components/AlertsManager';
import { ScenarioBar } from './components/ScenarioBar';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LoginPage } from './components/LoginPage';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  LayoutDashboard, 
  Database, 
  Cloud, 
  Bell, 
  ShieldCheck, 
  Settings, 
  HelpCircle,
  FlaskConical,
  Layers,
  LogOut,
  Sliders
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active navigation tab for the Sleek Interface sidebar
  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'watchlists' | 'alerts' | 'scenarios'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Core domain states
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('');
  const [snapshots, setSnapshots] = useState<Record<string, UserSnapshot>>({});
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [lastSnapshotTime, setLastSnapshotTime] = useState<string | null>(null);

  // Notifications & Sound State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketpulse_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showEngineSettings, setShowEngineSettings] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundService.isSoundMuted());
  const [engineWeights, setEngineWeights] = useState<EngineWeights>(() => {
    try {
      const saved = localStorage.getItem('marketpulse_weights');
      if (saved) {
        const parsed = JSON.parse(saved);
        changeEngine.setCustomWeights(parsed);
        return parsed;
      }
    } catch {}
    return DEFAULT_ENGINE_WEIGHTS;
  });

  // Track fired alerts in current session to prevent chime spam
  const firedAlertsCache = React.useRef<Set<string>>(new Set());

  // Market state & tick updates
  const [marketState, setMarketState] = useState<MarketState>(marketProvider.getMarketState());
  const [tickCounter, setTickCounter] = useState<number>(0);
  const [isSimulatingLiveTicks, setIsSimulatingLiveTicks] = useState<boolean>(true);

  // Modals & inspect
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize Firebase & test connection
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        loadUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Load user watchlists, snapshots, alerts from Firestore/Local
  const loadUserData = async (userId?: string) => {
    try {
      const [loadedWatchlists, loadedSnapshots, loadedAlerts, prevVisit] = await Promise.all([
        StorageRepository.getWatchlists(userId),
        StorageRepository.getSnapshots(userId),
        StorageRepository.getAlerts(userId),
        StorageRepository.recordUserVisit(userId),
      ]);

      setWatchlists(loadedWatchlists);
      if (loadedWatchlists.length > 0 && !activeWatchlistId) {
        setActiveWatchlistId(loadedWatchlists[0].id);
      }
      setSnapshots(loadedSnapshots);
      setAlerts(loadedAlerts);

      // Find earliest or representative snapshot timestamp
      const snapshotList = Object.values(loadedSnapshots);
      if (snapshotList.length > 0) {
        setLastSnapshotTime(snapshotList[0].capturedAt);
      } else {
        setLastSnapshotTime(prevVisit);
      }
    } catch (err) {
      console.error('Error loading MarketPulse repository data:', err);
    }
  };

  // 3. Live Tick Simulation Loop (Brownian motion tick generator)
  useEffect(() => {
    if (!isSimulatingLiveTicks || !user) return;

    const interval = setInterval(() => {
      marketProvider.simulateLiveTick();
      setMarketState(marketProvider.getMarketState());
      setTickCounter((prev) => prev + 1);
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingLiveTicks, user]);

  // Active Watchlist
  const activeWatchlist = useMemo(() => {
    return watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];
  }, [watchlists, activeWatchlistId]);

  // Evaluate Meaningful Change Engine for all stocks in active watchlist
  const analyses: AttentionAnalysis[] = useMemo(() => {
    if (!activeWatchlist) return [];

    let symbols = activeWatchlist.stockSymbols;
    if (globalSearch.trim()) {
      symbols = symbols.filter((s) => s.toLowerCase().includes(globalSearch.toLowerCase()));
    }

    const allQuotes = marketProvider.getAllStocks();

    return symbols.map((symbol) => {
      const stock = allQuotes.find((s) => s.symbol === symbol) || {
        symbol,
        companyName: symbol,
        exchange: 'NSE' as const,
        sector: 'General',
        currentPrice: 1000,
        previousClose: 1000,
        openPrice: 1000,
        highPrice: 1000,
        lowPrice: 1000,
        volume: 100000,
        avgVolume20D: 100000,
        high52W: 1200,
        low52W: 800,
        peRatio: 20,
        marketCapCr: 10000,
        history: { '1D': [], '1W': [], '1M': [], '3M': [], '1Y': [] },
        lastUpdated: new Date().toISOString(),
      };

      const prevSnapshot = snapshots[symbol] || null;

      return changeEngine.evaluateStock(
        stock,
        prevSnapshot,
        marketState.benchmarkNifty,
        alerts,
        marketState.providerStatus
      );
    }).sort((a, b) => b.currentScore - a.currentScore); // Prioritize highest attention first
  }, [activeWatchlist, snapshots, alerts, marketState, tickCounter, globalSearch]);

  // Selected stock analysis for detail modal
  const selectedStockAnalysis = useMemo(() => {
    if (!selectedStock) return null;
    const prevSnapshot = snapshots[selectedStock.symbol] || null;
    return changeEngine.evaluateStock(
      selectedStock,
      prevSnapshot,
      marketState.benchmarkNifty,
      alerts,
      marketState.providerStatus
    );
  }, [selectedStock, snapshots, alerts, marketState, tickCounter]);

  // Monitor analyses for new alert triggers and play alert chime
  useEffect(() => {
    if (!analyses || analyses.length === 0) return;

    const newNotifications: NotificationItem[] = [];

    analyses.forEach((analysis) => {
      // 1. Check user triggered alert rules
      analysis.triggeredAlerts.forEach((alert) => {
        const cacheKey = `${alert.id}_${Math.round(analysis.stock.currentPrice)}`;
        if (!firedAlertsCache.current.has(cacheKey)) {
          firedAlertsCache.current.add(cacheKey);

          const severity = alert.ruleType === 'PRICE_ABOVE' ? 'HIGH' : 'CRITICAL';
          soundService.playAlertChime(severity);

          const ruleLabel = alert.ruleType.replace(/_/g, ' ');
          newNotifications.push({
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            stockSymbol: analysis.stock.symbol,
            type: 'RULE_TRIGGER',
            message: `${analysis.stock.symbol} crossed alert threshold (${ruleLabel} ${alert.threshold.toLocaleString('en-IN')}) at price ₹${analysis.stock.currentPrice.toFixed(2)}`,
            severity,
            score: analysis.currentScore,
            read: false,
          });
        }
      });

      // 2. High Attention Anomaly Alert (Score >= 75 with 1.8x volume)
      if (analysis.currentScore >= 75 && analysis.signals.volumeRatio >= 1.8) {
        const anomalyKey = `anomaly_${analysis.stock.symbol}_${Math.round(analysis.currentScore)}`;
        if (!firedAlertsCache.current.has(anomalyKey)) {
          firedAlertsCache.current.add(anomalyKey);

          soundService.playAlertChime('CRITICAL');

          newNotifications.push({
            id: `notif_anomaly_${Date.now()}_${analysis.stock.symbol}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            stockSymbol: analysis.stock.symbol,
            type: 'ANOMALY',
            message: `High Velocity Anomaly: ${analysis.stock.symbol} surged to attention score ${analysis.currentScore}/100 with ${analysis.signals.volumeRatio}× abnormal volume`,
            severity: 'CRITICAL',
            score: analysis.currentScore,
            read: false,
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        const updated = [...newNotifications, ...prev].slice(0, 50);
        try {
          localStorage.setItem('marketpulse_notifications', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [analyses]);

  const handleToggleMute = () => {
    const next = soundService.toggleMute();
    setIsMuted(next);
    showToast(next ? 'Alert sounds muted' : 'Alert chimes active', 'info');
  };

  const handleSaveEngineWeights = (newWeights: EngineWeights) => {
    changeEngine.setCustomWeights(newWeights);
    setEngineWeights(newWeights);
    try {
      localStorage.setItem('marketpulse_weights', JSON.stringify(newWeights));
    } catch {}
    setTickCounter((c) => c + 1); // Trigger recalculation
    showToast('Updated Attention Formula weights!', 'success');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    firedAlertsCache.current.clear();
    try {
      localStorage.removeItem('marketpulse_notifications');
    } catch {}
    showToast('Cleared alert notification stream', 'info');
  };

  // Handler: Update Snapshot Baseline (Freeze current prices as new baseline)
  const handleUpdateSnapshot = useCallback(async () => {
    const allQuotes = marketProvider.getAllStocks();
    const newSnapshots: UserSnapshot[] = [];
    const timestamp = new Date().toISOString();

    allQuotes.forEach((stock) => {
      newSnapshots.push({
        id: `snap_${stock.symbol}_${Date.now()}`,
        userId: user?.uid || 'active_user',
        stockSymbol: stock.symbol,
        price: stock.currentPrice,
        volume: stock.volume,
        attentionScore: 0,
        capturedAt: timestamp,
      });
    });

    await StorageRepository.saveBatchSnapshots(newSnapshots, user?.uid);
    const map: Record<string, UserSnapshot> = {};
    newSnapshots.forEach((s) => (map[s.stockSymbol] = s));
    setSnapshots(map);
    setLastSnapshotTime(timestamp);
    showToast('Snapshot captured! Baseline reset to current prices.', 'success');
  }, [user]);

  // Handler: Watchlist CRUD
  const handleCreateWatchlist = async (name: string) => {
    const newWl: Watchlist = {
      id: `wl_${Date.now()}`,
      userId: user?.uid || 'active_user',
      name,
      stockSymbols: ['RELIANCE', 'TCS'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageRepository.saveWatchlist(newWl, user?.uid);
    setWatchlists((prev) => [...prev, newWl]);
    setActiveWatchlistId(newWl.id);
    showToast(`Created watchlist "${name}"`, 'success');
  };

  const handleDeleteWatchlist = async (id: string) => {
    await StorageRepository.deleteWatchlist(id, user?.uid);
    setWatchlists((prev) => prev.filter((w) => w.id !== id));
    if (activeWatchlistId === id) {
      const remaining = watchlists.filter((w) => w.id !== id);
      if (remaining.length > 0) setActiveWatchlistId(remaining[0].id);
    }
    showToast('Watchlist deleted', 'info');
  };

  const handleAddStockToWatchlist = async (symbol: string) => {
    if (!activeWatchlist) return;
    if (activeWatchlist.stockSymbols.includes(symbol)) return;

    const updated: Watchlist = {
      ...activeWatchlist,
      stockSymbols: [...activeWatchlist.stockSymbols, symbol],
      updatedAt: new Date().toISOString(),
    };
    await StorageRepository.saveWatchlist(updated, user?.uid);
    setWatchlists((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    showToast(`Added ${symbol} to ${activeWatchlist.name}`, 'success');
  };

  const handleRemoveStockFromWatchlist = async (symbol: string) => {
    if (!activeWatchlist) return;
    const updated: Watchlist = {
      ...activeWatchlist,
      stockSymbols: activeWatchlist.stockSymbols.filter((s) => s !== symbol),
      updatedAt: new Date().toISOString(),
    };
    await StorageRepository.saveWatchlist(updated, user?.uid);
    setWatchlists((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    showToast(`Removed ${symbol} from watchlist`, 'info');
  };

  // Handler: Alerts CRUD
  const handleAddAlert = async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAlert: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await StorageRepository.saveAlert(newAlert, user?.uid);
    setAlerts((prev) => [...prev, newAlert]);
    showToast(`Alert set for ${newAlert.stockSymbol}`, 'success');
  };

  const handleToggleAlert = async (alert: AlertRule) => {
    const updated: AlertRule = {
      ...alert,
      enabled: !alert.enabled,
      updatedAt: new Date().toISOString(),
    };
    await StorageRepository.saveAlert(updated, user?.uid);
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
  };

  const handleDeleteAlert = async (id: string) => {
    await StorageRepository.deleteAlert(id, user?.uid);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('Alert rule removed', 'info');
  };

  // Handler: Provider Reliability State
  const handleSetProviderStatus = (status: ProviderStatus) => {
    marketProvider.setStatus(status);
    setMarketState(marketProvider.getMarketState());
    showToast(`Simulating provider state: ${status}`, status === 'LIVE' ? 'success' : 'warn');
  };

  // Scenarios
  const handleApplyScenarioBreakout = () => {
    marketProvider.applyScenarioBreakout();
    setMarketState(marketProvider.getMarketState());
    setTickCounter((c) => c + 1);
    showToast('Applied Scenario 1: RELIANCE Breakout (+4.82%, 2.4× Vol, crossed ₹1,500 target)', 'success');
  };

  const handleApplyScenarioEarningsFall = () => {
    marketProvider.applyScenarioEarningsFall();
    setMarketState(marketProvider.getMarketState());
    setTickCounter((c) => c + 1);
    showToast('Applied Scenario 2: TCS Earnings Gap Down (-3.8%, 2.85× Vol, High Volatility)', 'warn');
  };

  const handleApplyScenarioCalm = () => {
    marketProvider.applyScenarioCalm();
    setMarketState(marketProvider.getMarketState());
    setTickCounter((c) => c + 1);
    showToast('Applied Scenario 3: Calm Session (All movements within normal bounds)', 'info');
  };

  // Sign-Out
  const handleSignOut = async () => {
    await logoutUser();
    setUser(null);
    showToast('Signed out. Please sign in to re-enter.', 'info');
  };

  // 1. Initial Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
          <div className="w-5 h-5 bg-white rounded-xs rotate-45" />
        </div>
        <div className="text-white font-bold text-lg tracking-tight">MarketPulse Intelligence</div>
        <p className="text-slate-400 text-xs mt-1">Connecting to Firebase Services...</p>
        <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Gateway Login Screen: SHOW LOGIN PAGE FIRST BEFORE ENTERING WEBSITE
  if (!user) {
    return (
      <LoginPage
        user={null}
        onAuthSuccess={(loggedUser) => {
          setUser(loggedUser);
          loadUserData(loggedUser.uid);
          showToast(`Welcome ${loggedUser.displayName || loggedUser.email || 'Trader'}! Entering MarketPulse...`, 'success');
        }}
      />
    );
  }

  // 3. User is authenticated -> Render the full website application
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Sleek Top Navigation */}
      <Header
        marketState={marketState}
        onStatusChange={handleSetProviderStatus}
        lastSnapshotTime={lastSnapshotTime}
        onUpdateSnapshot={handleUpdateSnapshot}
        user={user}
        onSignIn={() => {}}
        onSignOut={handleSignOut}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        unreadNotificationsCount={notifications.length}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        onOpenSettings={() => setShowEngineSettings(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Two-Pane Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sleek Dark Sidebar matching the Sleek Interface Theme */}
        <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col gap-8 flex-shrink-0 hidden lg:flex">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
              Infrastructure & Engines
            </p>
            <nav className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => {
                  setActiveNavTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  activeNavTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('watchlists');
                  const el = document.getElementById('watchlist-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  activeNavTab === 'watchlists'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Watchlist Universe</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('alerts');
                  const el = document.getElementById('alerts-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  activeNavTab === 'alerts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Alert Rules & Triggers</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('scenarios');
                  const el = document.getElementById('scenarios-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer text-left ${
                  activeNavTab === 'scenarios'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Simulator & Scenarios</span>
              </button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
              Security & Architecture
            </p>
            <nav className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => setShowArchitectureModal(true)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-slate-800 hover:text-slate-200 rounded-lg font-medium transition-all cursor-pointer text-left"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Firestore ABAC Rules</span>
              </button>

              <button
                onClick={() => setShowArchitectureModal(true)}
                className="flex items-center gap-3 py-2 px-3 hover:bg-slate-800 hover:text-slate-200 rounded-lg font-medium transition-all cursor-pointer text-left"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Architecture Blueprint</span>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 py-2 px-3 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 rounded-lg font-medium transition-all cursor-pointer text-left mt-2"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out Account</span>
              </button>
            </nav>
          </div>

          {/* Bottom Firebase Integration Card from Sleek Interface Theme */}
          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-200">Firebase Firestore</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[92%]" />
              </div>
              <p className="text-[10px] mt-2 text-slate-400 flex items-center justify-between">
                <span>99.9% Sync Latency</span>
                <span className="font-mono text-emerald-400">14ms</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Sleek Main Content Canvas */}
        <main className="flex-1 p-5 sm:p-8 bg-[#f1f5f9] flex flex-col gap-8 overflow-y-auto">
          {/* Main System Overview Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                System Overview & Intelligence
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Continuously evaluating watched equities and prioritizing actionable market changes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateSnapshot}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Capture Snapshot
              </button>
              <button
                onClick={() => setShowArchitectureModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Engine Blueprint
              </button>
            </div>
          </header>

          {/* Evaluator Stress Test Bar */}
          <div id="scenarios-section">
            <ScenarioBar
              onApplyScenarioBreakout={handleApplyScenarioBreakout}
              onApplyScenarioEarningsFall={handleApplyScenarioEarningsFall}
              onApplyScenarioCalm={handleApplyScenarioCalm}
              onSetStatus={handleSetProviderStatus}
              currentStatus={marketState.providerStatus}
              isSimulatingLiveTicks={isSimulatingLiveTicks}
              onToggleLiveTicks={() => setIsSimulatingLiveTicks(!isSimulatingLiveTicks)}
              onFreezeSnapshot={handleUpdateSnapshot}
            />
          </div>

          {/* "Since You Were Away" Hero & Metric Cards */}
          <div id="dashboard-section">
            <SinceYouWereAway
              analyses={analyses}
              lastSnapshotTime={lastSnapshotTime}
              onSelectStock={(stock) => setSelectedStock(stock)}
              onUpdateSnapshot={handleUpdateSnapshot}
            />
          </div>

          {/* Watchlist Manager Section */}
          <div id="watchlist-section">
            <WatchlistManager
              watchlists={watchlists}
              activeWatchlistId={activeWatchlistId}
              onSelectWatchlist={(id) => setActiveWatchlistId(id)}
              onCreateWatchlist={handleCreateWatchlist}
              onDeleteWatchlist={handleDeleteWatchlist}
              onAddStockToWatchlist={handleAddStockToWatchlist}
              onRemoveStockFromWatchlist={handleRemoveStockFromWatchlist}
              analyses={analyses}
              onSelectStock={(stock) => setSelectedStock(stock)}
              lastSnapshotTime={lastSnapshotTime}
            />
          </div>

          {/* Alerts & Rules Section */}
          <div id="alerts-section">
            <AlertsManager
              alerts={alerts}
              onToggleAlert={handleToggleAlert}
              onDeleteAlert={handleDeleteAlert}
              onAddAlert={handleAddAlert}
              analyses={analyses}
            />
          </div>
        </main>
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && selectedStockAnalysis && (
        <StockDetailModal
          stock={selectedStock}
          analysis={selectedStockAnalysis}
          onClose={() => setSelectedStock(null)}
          onAddAlert={handleAddAlert}
        />
      )}

      {/* Architecture Blueprint Modal */}
      {showArchitectureModal && (
        <ArchitectureModal onClose={() => setShowArchitectureModal(false)} />
      )}

      {/* Real-time Notification Slide-Over Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        notifications={notifications}
        onClearAll={handleClearNotifications}
        onSelectStock={(symbol) => {
          const s = marketProvider.getAllStocks().find((item) => item.symbol === symbol);
          if (s) setSelectedStock(s);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Attention Formula Configurator Modal */}
      <EngineSettingsModal
        isOpen={showEngineSettings}
        onClose={() => setShowEngineSettings(false)}
        weights={engineWeights}
        onSaveWeights={handleSaveEngineWeights}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
