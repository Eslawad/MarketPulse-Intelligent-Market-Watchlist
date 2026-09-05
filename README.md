# MarketPulse — Intelligent Market Watchlist
### Code by Groww 2026 — Engineering Submission

> **Current status:** This repository is a polished frontend prototype of the MarketPulse concept, focused on the “Since You Were Away” intelligence workflow, meaningful-change prioritization, and demo-ready market scenarios. The product story and UX are strongly aligned with the challenge brief, while the full backend stack described in the specification is intentionally left for a production-ready follow-up implementation.

> **"Investors often return to their watchlist and have to manually scan every stock to understand what changed. MarketPulse solves this by remembering the user's previous market snapshot, continuously evaluating watched stocks, detecting meaningful changes, and presenting a prioritized explanation of what happened and why it deserves attention."**

---

## 1. Core Problem & Solution

Traditional stock watchlists display a grid of tickers with percentage changes since yesterday's close. When an investor checks in at 11:30 AM after having previously checked at 9:30 AM, they cannot easily tell:
- Did this stock surge just now, or did it open high and stay flat?
- Is this price movement backed by anomalous trading volume (e.g. institutional accumulation)?
- Did this stock cross my predefined target threshold while I was away?
- Did it outperform the broad market benchmark (NIFTY 50 / SENSEX)?

**MarketPulse** answers: **"What meaningfully changed in my watchlist since I last checked, and what deserves my attention now?"**

---

## 2. Key Features

1. **"Since You Were Away" Dashboard**:
   - Primary entry screen comparing the current market tick against the user's previous visit snapshot.
   - Categorizes stocks into **Critical Attention (80–100)**, **High Attention (60–79)**, **Moderate Shift (35–59)**, and **Calm (0–34)**.
   - Reassures the user by explicitly collapsing watched stocks that have experienced no anomalous behavior.

2. **Deterministic Meaningful Change Engine**:
   - Computes 6 mathematical signal detectors without relying on opaque, unpredictable LLMs:
     1. **Price Movement**: Delta between previous check-in snapshot and current price.
     2. **Volume Anomaly**: Compares current volume against 20-day historical average (e.g., 2.4× volume breakout).
     3. **Threshold Crossing**: Detects user-configured price floors, ceilings, or surge targets.
     4. **Relative Benchmark Performance**: Outperformance or underperformance relative to NIFTY 50 and SENSEX.
     5. **Volatility Anomaly**: Intraday high-to-low range vs typical historical swing.
     6. **Gap Detection**: Gap-up or gap-down from previous close.

3. **Attention Score Formula (0–100)**:
   $$\text{Attention Score} = \text{Price Impact (25\%)} + \text{Volume Anomaly (20\%)} + \text{Threshold Event (20\%)} + \text{Benchmark Delta (15\%)} + \text{Volatility (10\%)} + \text{Data Freshness (10\%)}$$

4. **Persistent User Snapshot System**:
   - Stores user-specific baseline records in Firebase Firestore (`/users/{userId}/snapshots/{symbol}`).
   - Enables users to update their check-in snapshot whenever they complete an inspection session.

5. **Multi-Watchlist Management**:
   - Create, switch, and delete watchlists (e.g., Core Portfolio, Tech Growth, Banking).
   - Real-time stock search across Indian equities (NSE/BSE) with sector categorization and duplicate checks.

6. **Custom Alert Rules vs. System Anomalies**:
   - Configure custom conditions: Price Above, Price Below, % Movement, and Volume Surge.
   - Distinct separation between User-Configured Rules and System-Detected Anomalies.

7. **Interactive Stock Detail Inspection**:
   - Multi-timeframe interactive SVG chart (1D, 1W, 1M, 3M, 1Y) with hover point inspection.
   - Radar signal breakdown of the 6 detection factors.
   - "What Changed?" chronological event audit timeline.

8. **Provider Reliability & Fault Tolerance**:
   - Four distinct provider states: `LIVE`, `DELAYED`, `STALE`, and `UNAVAILABLE`.
   - Never crashes with a generic 500 error; gracefully serves cached snapshot data with clear amber warnings.

---

## 3. Technology Stack & Database Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Database & Persistence**: Firebase Firestore with Attribute-Based Access Control (ABAC).
- **Authentication**: Firebase Authentication with Email/Password and Anonymous sign-in.
- **Security Rules**: Enforced zero-trust scoping:
  ```
  match /users/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
    match /watchlists/{watchlistId} { ... }
    match /snapshots/{snapshotId} { ... }
    match /alerts/{alertId} { ... }
  }
  ```

---

## 4. Demonstrating & Testing Scenarios (Judge Toolbar)

To evaluate how MarketPulse handles diverse market conditions, the built-in toolbar allows instant scenario testing:
- **Scenario 1 (RELIANCE Breakout)**: Simulates RELIANCE surging +4.82% on 2.4× volume and crossing the ₹1,500 target threshold.
- **Scenario 2 (TCS Earnings Drop)**: Simulates a gap-down sell-off (-3.8%) on heavy volume and elevated volatility.
- **Scenario 3 (Calm Session)**: Simulates a quiet trading day where all stocks remain within ±0.3% with normal volume.
- **Scenario 4 (Stale Feed Test)**: Simulates an external provider disconnection, showcasing graceful cached snapshot fallback.
- **Live Ticks**: Real-time tick simulation with Brownian motion.
- **Capture Snapshot**: Freezes current market prices as a new personal baseline snapshot.

---

## 5. Running Locally in VS Code (Downloaded ZIP)

When you download the project ZIP and run it on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Open **`http://localhost:3000`** in Google Chrome or Microsoft Edge.

### Login options on `localhost`:
1. **Email/Password**: Register or sign in using the email form on the login page.
2. **Demo Trader**: Click **"Enter as Demo Trader (Instant Access)"** for immediate guest access without any credentials.
3. **VS Code Simple Browser**: Always open `http://localhost:3000` in a full desktop browser (Chrome/Edge), not VS Code's internal embedded browser.

