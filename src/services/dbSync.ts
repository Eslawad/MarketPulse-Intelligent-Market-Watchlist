import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Watchlist, UserSnapshot, AlertRule, ChangeEvent } from '../types/market';

const LOCAL_STORAGE_KEYS = {
  WATCHLISTS: 'marketpulse_watchlists_v1',
  SNAPSHOTS: 'marketpulse_snapshots_v1',
  ALERTS: 'marketpulse_alerts_v1',
  EVENTS: 'marketpulse_events_v1',
  LAST_VISIT: 'marketpulse_last_visit_v1',
};

// Default seed data for immediate demonstration
export const DEFAULT_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl_core',
    userId: 'demo_user',
    name: 'Core Portfolio',
    stockSymbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'wl_growth',
    userId: 'demo_user',
    name: 'High Growth & Tech',
    stockSymbols: ['TATAMOTORS', 'BHARTIARTL', 'WIPRO', 'BAJFINANCE'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const DEFAULT_SNAPSHOTS: Record<string, UserSnapshot> = {
  RELIANCE: {
    id: 'snap_RELIANCE',
    userId: 'demo_user',
    stockSymbol: 'RELIANCE',
    price: 1435.00, // previous snapshot price
    volume: 2180000,
    attentionScore: 24,
    capturedAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
  },
  TCS: {
    id: 'snap_TCS',
    userId: 'demo_user',
    stockSymbol: 'TCS',
    price: 3524.40,
    volume: 1440000,
    attentionScore: 18,
    capturedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  INFY: {
    id: 'snap_INFY',
    userId: 'demo_user',
    stockSymbol: 'INFY',
    price: 1766.00,
    volume: 3800000,
    attentionScore: 12,
    capturedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  HDFCBANK: {
    id: 'snap_HDFCBANK',
    userId: 'demo_user',
    stockSymbol: 'HDFCBANK',
    price: 1869.40,
    volume: 4900000,
    attentionScore: 28,
    capturedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  ICICIBANK: {
    id: 'snap_ICICIBANK',
    userId: 'demo_user',
    stockSymbol: 'ICICIBANK',
    price: 1244.00,
    volume: 5300000,
    attentionScore: 15,
    capturedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
};

export const DEFAULT_ALERTS: AlertRule[] = [
  {
    id: 'alert_1',
    userId: 'demo_user',
    stockSymbol: 'RELIANCE',
    ruleType: 'PRICE_ABOVE',
    threshold: 1500.00,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'alert_2',
    userId: 'demo_user',
    stockSymbol: 'TCS',
    ruleType: 'PRICE_BELOW',
    threshold: 3450.00,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'alert_3',
    userId: 'demo_user',
    stockSymbol: 'HDFCBANK',
    ruleType: 'PCT_CHANGE_ABOVE',
    threshold: 2.5,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export class StorageRepository {
  // Watchlists
  public static async getWatchlists(userId?: string): Promise<Watchlist[]> {
    if (auth.currentUser && userId) {
      const path = `users/${userId}/watchlists`;
      try {
        const querySnapshot = await getDocs(collection(db, path));
        if (!querySnapshot.empty) {
          const list: Watchlist[] = [];
          querySnapshot.forEach((d) => list.push(d.data() as Watchlist));
          return list;
        }
      } catch (err) {
        console.warn('Firestore read error, falling back to local storage:', err);
      }
    }

    // Local fallback
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.WATCHLISTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local watchlists', e);
      }
    }
    // Set initial
    localStorage.setItem(LOCAL_STORAGE_KEYS.WATCHLISTS, JSON.stringify(DEFAULT_WATCHLISTS));
    return DEFAULT_WATCHLISTS;
  }

  public static async saveWatchlist(wl: Watchlist, userId?: string): Promise<void> {
    // Local save
    const current = await this.getWatchlists(userId);
    const index = current.findIndex((w) => w.id === wl.id);
    let updated: Watchlist[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = wl;
    } else {
      updated = [...current, wl];
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.WATCHLISTS, JSON.stringify(updated));

    // Firestore save if signed in and uid matches
    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/watchlists/${wl.id}`;
      try {
        await setDoc(doc(db, 'users', userId, 'watchlists', wl.id), {
          ...wl,
          userId,
        });
      } catch (err) {
        console.warn('Firestore watchlist write error (saved locally):', err);
      }
    }
  }

  public static async deleteWatchlist(wlId: string, userId?: string): Promise<void> {
    const current = await this.getWatchlists(userId);
    const updated = current.filter((w) => w.id !== wlId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WATCHLISTS, JSON.stringify(updated));

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/watchlists/${wlId}`;
      try {
        await deleteDoc(doc(db, 'users', userId, 'watchlists', wlId));
      } catch (err) {
        console.warn('Firestore watchlist delete error (deleted locally):', err);
      }
    }
  }

  // Snapshots
  public static async getSnapshots(userId?: string): Promise<Record<string, UserSnapshot>> {
    if (auth.currentUser && userId) {
      const path = `users/${userId}/snapshots`;
      try {
        const querySnapshot = await getDocs(collection(db, path));
        if (!querySnapshot.empty) {
          const map: Record<string, UserSnapshot> = {};
          querySnapshot.forEach((d) => {
            const data = d.data() as UserSnapshot;
            map[data.stockSymbol] = data;
          });
          return map;
        }
      } catch (err) {
        console.warn('Firestore snapshots fetch error, using local fallback:', err);
      }
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SNAPSHOTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local snapshots', e);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.SNAPSHOTS, JSON.stringify(DEFAULT_SNAPSHOTS));
    return DEFAULT_SNAPSHOTS;
  }

  public static async saveSnapshot(snapshot: UserSnapshot, userId?: string): Promise<void> {
    const current = await this.getSnapshots(userId);
    current[snapshot.stockSymbol] = snapshot;
    localStorage.setItem(LOCAL_STORAGE_KEYS.SNAPSHOTS, JSON.stringify(current));

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/snapshots/${snapshot.stockSymbol}`;
      try {
        await setDoc(doc(db, 'users', userId, 'snapshots', snapshot.stockSymbol), {
          ...snapshot,
          userId,
        });
      } catch (err) {
        console.warn('Firestore snapshot write error (saved locally):', err);
      }
    }
  }

  public static async saveBatchSnapshots(snapshots: UserSnapshot[], userId?: string): Promise<void> {
    const current = await this.getSnapshots(userId);
    snapshots.forEach((s) => {
      current[s.stockSymbol] = s;
    });
    localStorage.setItem(LOCAL_STORAGE_KEYS.SNAPSHOTS, JSON.stringify(current));

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      for (const s of snapshots) {
        try {
          await setDoc(doc(db, 'users', userId, 'snapshots', s.stockSymbol), {
            ...s,
            userId,
          });
        } catch (err) {
          console.warn('Snapshot batch write item error', err);
        }
      }
    }
  }

  // Alerts
  public static async getAlerts(userId?: string): Promise<AlertRule[]> {
    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/alerts`;
      try {
        const querySnapshot = await getDocs(collection(db, path));
        if (!querySnapshot.empty) {
          const list: AlertRule[] = [];
          querySnapshot.forEach((d) => list.push(d.data() as AlertRule));
          return list;
        }
      } catch (err) {
        console.warn('Firestore alerts fetch error:', err);
      }
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ALERTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local alerts', e);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALERTS, JSON.stringify(DEFAULT_ALERTS));
    return DEFAULT_ALERTS;
  }

  public static async saveAlert(alert: AlertRule, userId?: string): Promise<void> {
    const current = await this.getAlerts(userId);
    const idx = current.findIndex((a) => a.id === alert.id);
    let updated: AlertRule[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = alert;
    } else {
      updated = [...current, alert];
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALERTS, JSON.stringify(updated));

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/alerts/${alert.id}`;
      try {
        await setDoc(doc(db, 'users', userId, 'alerts', alert.id), {
          ...alert,
          userId,
        });
      } catch (err) {
        console.warn('Firestore alert write error (saved locally):', err);
      }
    }
  }

  public static async deleteAlert(alertId: string, userId?: string): Promise<void> {
    const current = await this.getAlerts(userId);
    const updated = current.filter((a) => a.id !== alertId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ALERTS, JSON.stringify(updated));

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/alerts/${alertId}`;
      try {
        await deleteDoc(doc(db, 'users', userId, 'alerts', alertId));
      } catch (err) {
        console.warn('Firestore alert delete error (deleted locally):', err);
      }
    }
  }

  // Profile visit timestamp
  public static async recordUserVisit(userId?: string): Promise<string> {
    const now = new Date().toISOString();
    const prev = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISIT) || new Date(Date.now() - 4 * 3600000).toISOString();
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_VISIT, now);

    if (auth.currentUser && userId && auth.currentUser.uid === userId) {
      const path = `users/${userId}/profile/main`;
      try {
        await setDoc(doc(db, 'users', userId, 'profile', 'main'), {
          userId,
          lastVisitedAt: now,
          updatedAt: now,
        }, { merge: true });
      } catch (err) {
        console.warn('Could not update profile visit timestamp on Firestore:', err);
      }
    }
    return prev;
  }
}
