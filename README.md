# MarketPulse — Intelligent Market Watchlist

### Code by Groww 2026 — Engineering Submission

> **Current Status:** MarketPulse is a polished frontend prototype focused on the **“Since You Were Away”** workflow, meaningful-change detection, attention prioritization, and market-data reliability scenarios.

---

## 🚀 Live Demo

**[Open MarketPulse](https://fastidious-pithivier-f05cd7.netlify.app/)**

Demo access:

**Enter as Demo Trader (Instant Access)**

The application can be opened directly in Chrome or Microsoft Edge without local setup.

---

# 1. Problem Statement

Traditional stock watchlists mainly show the current price and percentage change.

When a user checks the watchlist again after some time, they still need to manually inspect every stock to understand:

* What changed?
* When did it change?
* Was the movement significant?
* Was the movement supported by volume?
* Did the stock cross a personal price target?
* Did it outperform the market?
* Which stock deserves attention first?

### MarketPulse Solution

MarketPulse remembers the user's previous market snapshot and compares it with the current market state.

It detects meaningful changes and prioritizes them using an explainable **Attention Score**.

The main question is:

> **“What meaningfully changed in my watchlist since I was away?”**

---

# 2. Core Product Idea

The central experience is:

```text
Previous User Snapshot
        ↓
Current Market State
        ↓
Meaningful Change Engine
        ↓
Attention Score
        ↓
Prioritized Changes
        ↓
User Inspection
```

Instead of showing more information, MarketPulse helps users understand **what matters first**.

---

# 3. Key Features

## 3.1 Since You Were Away

The main dashboard focuses on changes since the user's previous inspection.

It provides:

* Previous visit comparison
* Meaningful-change detection
* Attention prioritization
* Highest-priority stocks
* Calm stocks
* Market overview
* Data freshness information

Stocks are grouped into:

```text
80–100  Critical Attention
60–79   High Attention
35–59   Moderate Shift
0–34    Calm
```

This allows users to focus on meaningful movements instead of scanning every ticker.

---

# 4. Meaningful Change Engine

The core intelligence of MarketPulse is a deterministic change-detection engine.

It evaluates six signals.

## 4.1 Price Movement

Compares the current price with the user's previous snapshot.

Example:

```text
Previous Price: ₹1,450
Current Price:  ₹1,520

Movement: +4.83%
```

---

## 4.2 Volume Anomaly

Compares current trading volume against the recent historical average.

Example:

```text
Current Volume: 4.8M
20-Day Average: 2.0M

Volume Ratio: 2.4×
```

A large volume increase can indicate that the price movement deserves additional attention.

---

## 4.3 Threshold Crossing

Detects when a stock crosses a user-defined price threshold.

Example:

```text
Target:         ₹1,500
Previous Price: ₹1,492
Current Price:  ₹1,504

Result: Threshold Crossed
```

---

## 4.4 Relative Benchmark Performance

Compares the stock's movement with a broad market benchmark.

Supported examples:

* NIFTY 50
* SENSEX

Example:

```text
RELIANCE: +4.8%
NIFTY 50: +0.9%

Outperformance: +3.9%
```

---

## 4.5 Volatility Anomaly

Detects unusually large price ranges compared with normal stock movement.

This helps identify stocks experiencing abnormal intraday activity.

---

## 4.6 Gap Detection

Detects significant gap-up or gap-down movements from the previous close.

Example:

```text
Previous Close: ₹1,450
Opening Price:  ₹1,520

Gap Up: +4.83%
```

---

# 5. Attention Score

MarketPulse combines multiple signals into an explainable score from **0 to 100**.

Current weighting:

```text
Price Impact       25%
Volume Anomaly     20%
Threshold Event    20%
Benchmark Delta    15%
Volatility         10%
Data Freshness     10%
```

### Attention Levels

```text
80–100  Critical Attention
60–79   High Attention
35–59   Moderate Shift
0–34    Calm
```

The score answers:

> **“Which stock should I inspect first?”**

The Attention Score is **not**:

* A buy signal
* A sell signal
* An investment recommendation
* A financial prediction

It is only a prioritization mechanism.

---

# 6. Explainable Insights

MarketPulse does not simply display a percentage change.

It explains the signals behind the movement.

Example:

```text
RELIANCE needs attention

Price increased by 4.82%.

Trading volume is 2.4× the recent average.

The ₹1,500 threshold was crossed.

RELIANCE outperformed NIFTY 50.

Attention Score: 91
```

This makes the system easier to understand and defend during evaluation.

---

# 7. Persistent User Snapshots

MarketPulse maintains a user-specific baseline snapshot.

The prototype uses Firebase Firestore for persistence.

Conceptual structure:

```text
/users/{userId}/snapshots/{symbol}
```

A snapshot can contain:

* Stock symbol
* Previous price
* Previous volume
* Timestamp
* Attention score
* Relevant market metrics

When the user returns:

```text
Previous Snapshot
       ↓
Current State
       ↓
Change Detection
       ↓
Attention Score
       ↓
Meaningful Changes
```

This enables the **Since You Were Away** experience.

---

# 8. Multi-Watchlist Management

Users can create and manage multiple watchlists.

Examples:

```text
Core Portfolio
Tech Growth
Banking
Long Term
```

Supported operations:

* Create watchlist
* Delete watchlist
* Switch watchlist
* Add stocks
* Remove stocks
* Search stocks
* Prevent duplicates
* Organize stocks

---

# 9. Stock Search

Users can search Indian equities using:

* Stock symbol
* Company name
* Sector

Example:

```text
Search: REL

RELIANCE
Reliance Industries Ltd.
NSE
Energy
```

The goal is to make adding stocks to a watchlist quick and simple.

---

# 10. Custom Alerts

Users can configure their own alert rules.

Supported conditions include:

```text
Price Above
Price Below
Percentage Movement
Volume Surge
```

Example:

```text
Stock: RELIANCE

Alert when:
Price > ₹1,500
```

MarketPulse clearly separates:

```text
User-Configured Rules
        vs
System-Detected Anomalies
```

This prevents confusion between personal preferences and system-generated signals.

---

# 11. Stock Detail Page

Each stock has a dedicated inspection page.

It includes:

* Current price
* Percentage change
* Absolute change
* Price chart
* Volume
* Average volume
* Attention Score
* Signal breakdown
* Benchmark comparison
* Change timeline

Supported timeframes:

```text
1D
1W
1M
3M
1Y
```

---

# 12. Signal Breakdown

The stock detail page shows how the Attention Score was generated.

Example:

```text
Price Movement       ████████████████
Volume Anomaly       █████████████
Threshold Event      ███████████████
Benchmark Delta      █████████
Volatility           ███████
Data Freshness       █████████████
```

This makes the score explainable rather than a black-box value.

---

# 13. What Changed? Timeline

MarketPulse provides a chronological timeline of important events.

Example:

```text
10:42 AM
Threshold crossed
₹1,500 target reached

10:30 AM
Volume anomaly
Volume reached 2.4× average

10:05 AM
Price movement
Stock moved above +3%
```

This helps users understand how the situation developed.

---

# 14. Data Reliability

Market data may be delayed, missing, or temporarily unavailable.

MarketPulse therefore uses four states:

```text
LIVE
DELAYED
STALE
UNAVAILABLE
```

### LIVE

Recently received market information.

### DELAYED

Data is available but not real-time.

### STALE

The available snapshot is older than the configured freshness threshold.

### UNAVAILABLE

No current provider data is available.

When data is unavailable, the application can display the latest known snapshot while clearly communicating its freshness.

Example:

```text
⚠ Market data temporarily unavailable

Showing the last verified snapshot.

Last updated: 10:42 AM
```

The application should never silently represent stale data as live data.

---

# 15. Technology Stack

## Frontend

* React 19
* TypeScript
* Tailwind CSS
* Lucide Icons
* Motion
* SVG-based charts
* Responsive UI

## Authentication

* Firebase Authentication
* Email/Password
* Anonymous/Demo authentication

## Database

* Firebase Firestore

Used for:

* User snapshots
* Watchlists
* Watchlist items
* Alert rules
* User-specific state

## Security

Firebase Security Rules provide UID-based access control.

Conceptually:

```text
Authenticated User
        ↓
Firebase Authentication
        ↓
Firebase UID
        ↓
Firestore Security Rules
        ↓
User-Owned Resources
```

Users should only access their own watchlists, snapshots, alerts, and application state.

---

# 16. Demo Scenarios

MarketPulse includes a **Judge Toolbar** to demonstrate different market conditions.

This makes the core behavior deterministic and easy to evaluate.

## Scenario 1 — RELIANCE Breakout

```text
Price Change: +4.82%
Volume: 2.4× average
Threshold: ₹1,500 crossed
```

Expected:

```text
High / Critical Attention
```

---

## Scenario 2 — TCS Earnings Drop

```text
Price Change: -3.8%
Heavy Volume
Elevated Volatility
Gap Down
```

Expected:

```text
High Attention
```

---

## Scenario 3 — Calm Session

```text
Price movement: ±0.3%
Normal volume
No threshold crossing
```

Expected:

```text
Calm
```

This demonstrates that MarketPulse does not create unnecessary alerts.

---

## Scenario 4 — Stale Feed

Simulates an external market-data provider becoming unavailable.

Demonstrates:

* Stale-data detection
* Cached snapshot fallback
* Freshness warning
* Graceful behavior

---

# 17. Live Tick Simulation

The prototype supports simulated market ticks.

Controlled price movement demonstrates how the dashboard responds to changing market conditions.

The simulation is clearly separated from real market data.

---

# 18. Capture Snapshot

The user can capture the current market state as their personal baseline.

Example:

```text
Current Market State
        ↓
Capture Snapshot
        ↓
Personal Baseline
        ↓
Future Changes Compared
        ↓
Meaningful Changes
```

This is the foundation of the **Since You Were Away** feature.

---

# 19. Architecture

The current repository is primarily frontend-focused.

Conceptual production architecture:

```text
┌──────────────────────────┐
│ React + TypeScript       │
│ MarketPulse Frontend     │
└────────────┬─────────────┘
             │
             │ REST / API
             ↓
┌──────────────────────────┐
│ Spring Boot Backend      │
├──────────────────────────┤
│ Authentication           │
│ Watchlists               │
│ Market Data              │
│ Change Engine             │
│ Attention Scoring         │
│ Alerts                    │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       ↓           ↓
┌────────────┐ ┌──────────┐
│ PostgreSQL │ │  Redis   │
└────────────┘ └──────────┘
```

The backend architecture above represents the planned production implementation and is **not claimed as part of the current frontend prototype**.

---

# 20. Why Deterministic Intelligence?

MarketPulse deliberately does not use an LLM to decide whether a stock is important.

The core calculation is deterministic:

```text
Current Price
Previous Snapshot
Current Volume
Historical Volume
Benchmark Movement
User Threshold
        ↓
Deterministic Rules
        ↓
Signals
        ↓
Attention Score
```

Advantages:

* Explainability
* Reproducibility
* Testability
* Predictable behavior
* Easier debugging

AI can optionally be used later for natural-language explanations, while the underlying financial calculations remain deterministic.

---

# 21. Engineering Trade-offs

## Simple Architecture

The current prototype avoids unnecessary operational complexity.

A modular design is:

* Easier to develop
* Easier to test
* Easier to deploy
* Easier to understand

Individual modules can be separated later if scale requires it.

---

## Persistent Snapshots

A normal watchlist only shows the current state.

MarketPulse needs to know:

> **“What did this user see previously?”**

Therefore, snapshots are a core part of the product.

---

## Attention Prioritization

Showing every possible movement can create information overload.

The Attention Score allows the system to prioritize:

```text
Critical
   ↓
High
   ↓
Moderate
   ↓
Calm
```

---

## Provider States

External providers can experience:

* Delays
* Outages
* Missing data
* Rate limits

Explicit data states help prevent misleading information.

---

# 22. Current Prototype Status

The deployed application focuses on:

* Since You Were Away dashboard
* Meaningful Change Engine
* Attention Score
* Multi-watchlists
* Stock search
* Custom alerts
* Stock detail
* Signal breakdown
* Change timeline
* Scenario simulation
* Stale-data simulation
* Snapshot workflow
* Demo authentication
* Responsive UI

The current repository is a **frontend prototype**.

The production backend described earlier is documented as the next implementation stage.

---

# 23. Running Locally

## Prerequisites

Install:

* Node.js
* npm
* VS Code
* Google Chrome or Microsoft Edge

## Clone / Download

Download the repository and open the project folder in VS Code.

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Open Application

```text
http://localhost:3000
```

Open it in Chrome or Microsoft Edge.

---

# 24. Login Options

## Email / Password

Users can register or sign in using the authentication form.

## Demo Trader

For quick evaluation:

```text
Enter as Demo Trader (Instant Access)
```

This provides immediate demo access.

---

# 25. Deployment

MarketPulse is deployed using Netlify.

### Live Application

**https://fastidious-pithivier-f05cd7.netlify.app/**

The deployed application is intended for demonstration and evaluation of the core MarketPulse workflow.

---

# 26. Recommended Judge Demo

A short demonstration can follow this sequence:

```text
1. Open MarketPulse
       ↓
2. Enter as Demo Trader
       ↓
3. Open Since You Were Away
       ↓
4. Show meaningful changes
       ↓
5. Open RELIANCE
       ↓
6. Show Attention Score
       ↓
7. Explain signal breakdown
       ↓
8. Show What Changed timeline
       ↓
9. Open Watchlists
       ↓
10. Create an alert
       ↓
11. Trigger Breakout Scenario
       ↓
12. Demonstrate Stale Feed
       ↓
13. Return to Dashboard
```

---

# 27. Project Structure

Typical frontend structure:

```text
MarketPulse/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── data/
│   ├── utils/
│   ├── types/
│   └── App.tsx
│
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.*
├── README.md
└── .gitignore
```

---

# 28. Responsible Product Design

MarketPulse is an information and prioritization tool.

It does not provide:

* Buy recommendations
* Sell recommendations
* Guaranteed returns
* Personalized financial advice

The Attention Score only indicates that a stock has experienced a potentially meaningful change according to defined signals.

Users remain responsible for their own investment decisions.

---

# 29. AI Usage

AI-assisted development tools may be used during implementation for:

* Code generation
* Debugging
* Documentation
* UI improvements
* Test generation
* Refactoring

However, the main product decisions are based on explicit engineering logic.

Most importantly:

> **The Meaningful Change Engine and Attention Score are deterministic and explainable rather than being delegated to an LLM.**

This makes the system easier to test and defend.

---

# 30. Future Production Improvements

Potential next steps include:

* Java 21 + Spring Boot backend
* PostgreSQL persistence
* Redis caching
* Real market-data providers
* WebSocket live updates
* Background market-data processing
* Push notifications
* Email alerts
* Advanced volatility models
* Event-driven processing
* Provider failover
* Historical analytics
* Production monitoring
* Distributed tracing
* Horizontal scaling

These improvements are separated from the current prototype to keep the demonstrated product simple and reliable.

---

# 31. Product Philosophy

MarketPulse follows one principle:

> **“Don't show users more information. Help them understand what matters.”**

The product is designed around three questions:

### What changed?

Detect meaningful changes since the user's previous snapshot.

### Why does it matter?

Explain the signals contributing to the change.

### What should I look at first?

Prioritize stocks using the Attention Score.

---

# 32. Conclusion

MarketPulse transforms a traditional stock watchlist into an intelligent market-monitoring experience.

Instead of requiring users to manually inspect every ticker, it provides a personalized answer to:

> **“What changed since I was away?”**

It then explains:

> **“Why does it matter?”**

And prioritizes:

> **“What deserves my attention first?”**

---

## 🚀 Live Demo

**https://fastidious-pithivier-f05cd7.netlify.app/**

### Code by Groww 2026

**Build thoughtfully. Build something you can defend.**
