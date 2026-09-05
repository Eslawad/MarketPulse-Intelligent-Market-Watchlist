import {
  Stock,
  Benchmark,
  UserSnapshot,
  AlertRule,
  AttentionAnalysis,
  AttentionSeverity,
  SignalBreakdown,
  ProviderStatus,
  EngineWeights,
} from '../types/market';

export const DEFAULT_ENGINE_WEIGHTS: EngineWeights = {
  priceImpact: 25,
  volumeAnomaly: 20,
  thresholdCrossing: 20,
  relativeBenchmark: 15,
  volatilitySwing: 10,
  providerFreshness: 10,
};

export class MeaningfulChangeEngine {
  private customWeights: EngineWeights = DEFAULT_ENGINE_WEIGHTS;

  public setCustomWeights(weights: EngineWeights) {
    this.customWeights = weights;
  }

  public getCustomWeights(): EngineWeights {
    return this.customWeights;
  }

  /**
   * Evaluates a single stock against the user's previous check-in snapshot,
   * current market benchmark, and active alert rules with customizable engine weights.
   */
  public evaluateStock(
    stock: Stock,
    previousSnapshot: UserSnapshot | null,
    benchmark: Benchmark,
    userAlerts: AlertRule[],
    providerStatus: ProviderStatus = 'LIVE',
    customWeights?: EngineWeights
  ): AttentionAnalysis {
    const weights = customWeights || this.customWeights || DEFAULT_ENGINE_WEIGHTS;

    // 1. Baseline price comparison:
    // If user has a snapshot, compare against the snapshot's price.
    // Otherwise, compare against previousClose.
    const baselinePrice = previousSnapshot ? previousSnapshot.price : stock.previousClose;
    const priceDelta = stock.currentPrice - baselinePrice;
    const priceChangePct = Number(((priceDelta / baselinePrice) * 100).toFixed(2));

    // 2. Volume Anomaly calculation
    const volumeRatio = stock.avgVolume20D > 0
      ? Number((stock.volume / stock.avgVolume20D).toFixed(2))
      : 1.0;

    // 3. User Threshold crossing detection
    const stockAlerts = userAlerts.filter(
      (a) => a.stockSymbol === stock.symbol && a.enabled
    );
    let thresholdCrossed = false;
    let thresholdDetail = '';
    const triggeredAlerts: AlertRule[] = [];

    stockAlerts.forEach((alert) => {
      let isTriggered = false;
      if (alert.ruleType === 'PRICE_ABOVE') {
        if (baselinePrice < alert.threshold && stock.currentPrice >= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Crossed above target ₹${alert.threshold.toLocaleString('en-IN')}`;
        } else if (stock.currentPrice >= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Trading above threshold ₹${alert.threshold.toLocaleString('en-IN')}`;
        }
      } else if (alert.ruleType === 'PRICE_BELOW') {
        if (baselinePrice > alert.threshold && stock.currentPrice <= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Fell below floor ₹${alert.threshold.toLocaleString('en-IN')}`;
        } else if (stock.currentPrice <= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Trading below floor ₹${alert.threshold.toLocaleString('en-IN')}`;
        }
      } else if (alert.ruleType === 'PCT_CHANGE_ABOVE') {
        if (priceChangePct >= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Up +${priceChangePct}% (exceeds ${alert.threshold}%)`;
        }
      } else if (alert.ruleType === 'PCT_CHANGE_BELOW') {
        if (priceChangePct <= -Math.abs(alert.threshold)) {
          isTriggered = true;
          thresholdDetail = `Down ${priceChangePct}% (drops past -${alert.threshold}%)`;
        }
      } else if (alert.ruleType === 'VOLUME_SURGE') {
        if (volumeRatio >= alert.threshold) {
          isTriggered = true;
          thresholdDetail = `Volume reached ${volumeRatio}× average (target ${alert.threshold}×)`;
        }
      }
      if (isTriggered) {
        thresholdCrossed = true;
        triggeredAlerts.push(alert);
      }
    });

    // 4. Relative Benchmark Delta (vs NIFTY 50)
    const relativeBenchmarkDelta = Number(
      (priceChangePct - benchmark.changePercent).toFixed(2)
    );

    // 5. Volatility Ratio (Intraday range vs current price)
    const dayRange = stock.highPrice - stock.lowPrice;
    const intradaySwingPct = (dayRange / stock.currentPrice) * 100;
    const volatilityRatio = Number((intradaySwingPct / 1.5).toFixed(2)); // normalized around 1.5% normal swing

    // 6. Gap calculation (Open vs Prev Close)
    const gapPct = Number(
      (((stock.openPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
    );

    // Compute Signal Scores weighted according to trader configuration:
    // A. Price Impact Score
    const maxPriceWeight = weights.priceImpact;
    const priceImpactScore = Math.min(maxPriceWeight, Math.round((Math.abs(priceChangePct) / 4.0) * maxPriceWeight));

    // B. Volume Anomaly Score
    const maxVolumeWeight = weights.volumeAnomaly;
    let volumeScore = 0;
    if (volumeRatio > 1.2) {
      volumeScore = Math.min(maxVolumeWeight, Math.round(((volumeRatio - 1.0) / 1.5) * maxVolumeWeight));
    }

    // C. Threshold Crossing Score
    const thresholdScore = thresholdCrossed ? weights.thresholdCrossing : 0;

    // D. Relative Benchmark Out/Underperformance Score
    const maxRelativeWeight = weights.relativeBenchmark;
    const relativeScore = Math.min(
      maxRelativeWeight,
      Math.round((Math.abs(relativeBenchmarkDelta) / 3.0) * maxRelativeWeight)
    );

    // E. Volatility Score
    const maxVolatilityWeight = weights.volatilitySwing;
    const volatilityScore = Math.min(
      maxVolatilityWeight,
      Math.round(Math.max(0, volatilityRatio - 1.0) * (maxVolatilityWeight * 0.8))
    );

    // F. Freshness / Data Quality Score
    const maxFreshnessWeight = weights.providerFreshness;
    let freshnessScore = maxFreshnessWeight;
    if (providerStatus === 'DELAYED') freshnessScore = Math.round(maxFreshnessWeight * 0.6);
    if (providerStatus === 'STALE') freshnessScore = Math.round(maxFreshnessWeight * 0.2);
    if (providerStatus === 'UNAVAILABLE') freshnessScore = 0;

    // Aggregate Total Attention Score (normalized to 0-100 based on total possible weights)
    const totalWeights = weights.priceImpact + weights.volumeAnomaly + weights.thresholdCrossing +
                         weights.relativeBenchmark + weights.volatilitySwing + weights.providerFreshness;
    const rawSum = priceImpactScore + volumeScore + thresholdScore + relativeScore + volatilityScore + freshnessScore;
    const normalizedScore = totalWeights > 0 ? Math.round((rawSum / totalWeights) * 100) : 0;
    const totalScore = Math.min(100, Math.max(0, normalizedScore));

    // Determine Classification Severity
    let severity: AttentionSeverity = 'NORMAL';
    if (totalScore >= 80) severity = 'CRITICAL';
    else if (totalScore >= 60) severity = 'HIGH';
    else if (totalScore >= 35) severity = 'MODERATE';

    const hasMeaningfulChange = severity === 'CRITICAL' || severity === 'HIGH' || severity === 'MODERATE';

    // Generate Human-Explainable Bullets
    const explanationBullets: string[] = [];
    if (previousSnapshot) {
      const sign = priceChangePct >= 0 ? '+' : '';
      explanationBullets.push(
        `Price moved ${sign}${priceChangePct}% (₹${priceDelta >= 0 ? '+' : ''}${priceDelta.toFixed(2)}) since your last snapshot.`
      );
    } else {
      const sign = priceChangePct >= 0 ? '+' : '';
      explanationBullets.push(
        `Price is ${sign}${priceChangePct}% today from previous close of ₹${stock.previousClose.toFixed(2)}.`
      );
    }

    if (volumeRatio >= 1.5) {
      explanationBullets.push(
        `Unusual volume: trading at ${volumeRatio}× its 20-day average volume (${stock.volume.toLocaleString('en-IN')} shares).`
      );
    } else if (volumeRatio < 0.6) {
      explanationBullets.push(
        `Subdued volume: only ${Math.round(volumeRatio * 100)}% of typical 20-day participation.`
      );
    }

    if (thresholdCrossed && thresholdDetail) {
      explanationBullets.push(`Alert rule triggered: ${thresholdDetail}.`);
    }

    if (Math.abs(relativeBenchmarkDelta) >= 1.5) {
      const direction = relativeBenchmarkDelta > 0 ? 'outperformed' : 'lagged';
      explanationBullets.push(
        `${direction.charAt(0).toUpperCase() + direction.slice(1)} ${benchmark.symbol} by ${Math.abs(relativeBenchmarkDelta)}% today.`
      );
    }

    if (Math.abs(gapPct) >= 1.2) {
      explanationBullets.push(
        `Opened with a ${gapPct > 0 ? 'gap-up' : 'gap-down'} of ${Math.abs(gapPct)}% at ₹${stock.openPrice.toFixed(2)}.`
      );
    }

    // Determine primary concise reason
    let primaryReason = 'Trading normally within historical boundaries';
    if (thresholdCrossed) {
      primaryReason = thresholdDetail || 'Threshold crossed';
    } else if (volumeRatio >= 2.0 && Math.abs(priceChangePct) >= 3.0) {
      primaryReason = `Heavy volume surge (${volumeRatio}×) with ${priceChangePct >= 0 ? '+' : ''}${priceChangePct}% move`;
    } else if (Math.abs(priceChangePct) >= 4.0) {
      primaryReason = `Significant price momentum (${priceChangePct >= 0 ? '+' : ''}${priceChangePct}%)`;
    } else if (volumeRatio >= 2.0) {
      primaryReason = `High volume anomaly (${volumeRatio}× normal volume)`;
    } else if (Math.abs(relativeBenchmarkDelta) >= 2.5) {
      primaryReason = `${relativeBenchmarkDelta > 0 ? 'Strong outperformance' : 'Underperforming'} vs ${benchmark.symbol}`;
    }

    // Synthesize automated "Why It Moved" AI intelligence paragraph
    let whyItMovedSummary = '';
    const sign = priceChangePct >= 0 ? '+' : '';
    const formattedPrice = `₹${stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (thresholdCrossed && volumeRatio >= 1.8) {
      whyItMovedSummary = `${stock.symbol} surged ${sign}${priceChangePct}% to ${formattedPrice} on aggressive ${volumeRatio}× 20-day volume, decisively triggering active alert "${thresholdDetail}". Alpha over ${benchmark.symbol} expanded to ${relativeBenchmarkDelta > 0 ? '+' : ''}${relativeBenchmarkDelta}%.`;
    } else if (priceChangePct <= -3.0 && volumeRatio >= 1.8) {
      whyItMovedSummary = `${stock.symbol} came under severe selling pressure, slipping ${priceChangePct}% to ${formattedPrice} with ${volumeRatio}× average liquidation volume. Intraday volatility spiked to ${intradaySwingPct.toFixed(1)}%, underperforming ${benchmark.symbol} by ${Math.abs(relativeBenchmarkDelta)}%.`;
    } else if (priceChangePct >= 3.0 && volumeRatio >= 1.8) {
      whyItMovedSummary = `${stock.symbol} posted an institutional breakout of ${sign}${priceChangePct}% to ${formattedPrice} backed by ${volumeRatio}× standard volume participation, diverging positively from the broader ${stock.sector} sector.`;
    } else if (thresholdCrossed) {
      whyItMovedSummary = `${stock.symbol} crossed user attention boundary: ${thresholdDetail} at ${formattedPrice} (${sign}${priceChangePct}% move relative to snapshot baseline).`;
    } else if (volumeRatio >= 2.2) {
      whyItMovedSummary = `High trading intensity detected in ${stock.symbol}: volume multiplied to ${volumeRatio}× standard 20-day baseline despite a moderate price change of ${sign}${priceChangePct}%, signalling institutional positioning or order block accumulation.`;
    } else if (Math.abs(priceChangePct) >= 3.5) {
      whyItMovedSummary = `${stock.symbol} recorded an outsized momentum shift of ${sign}${priceChangePct}% with intraday range of ₹${dayRange.toFixed(2)}, outpacing normal volatility limits.`;
    } else {
      whyItMovedSummary = `${stock.symbol} is trading in normal equilibrium at ${formattedPrice} (${sign}${priceChangePct}%), with volume tracking at ${volumeRatio}× normal participation and no active anomaly alerts violated.`;
    }

    // Timeline of intraday key events
    const timeline = [
      {
        time: '10:42 AM',
        type: 'Threshold Event',
        description: thresholdCrossed ? (thresholdDetail || `Crossed watch level`) : `Monitored active criteria`,
        severity: thresholdCrossed ? ('HIGH' as AttentionSeverity) : ('NORMAL' as AttentionSeverity),
      },
      {
        time: '10:15 AM',
        type: 'Volume Spike',
        description: `Accumulation velocity reached ${volumeRatio}× historical average`,
        severity: volumeRatio >= 2.0 ? ('HIGH' as AttentionSeverity) : ('NORMAL' as AttentionSeverity),
      },
      {
        time: '09:30 AM',
        type: 'Intraday Movement',
        description: `Price action shifted ${priceChangePct >= 0 ? '+' : ''}${priceChangePct}% relative to snapshot`,
        severity: Math.abs(priceChangePct) >= 3.0 ? ('MODERATE' as AttentionSeverity) : ('NORMAL' as AttentionSeverity),
      },
    ];

    const signals: SignalBreakdown = {
      priceChangePct,
      priceImpactScore,
      volumeRatio,
      volumeScore,
      thresholdCrossed,
      thresholdScore,
      thresholdDetail,
      relativeBenchmarkDelta,
      relativeScore,
      volatilityRatio,
      volatilityScore,
      gapPct,
      freshnessScore,
    };

    return {
      stock,
      previousSnapshot,
      currentScore: totalScore,
      severity,
      hasMeaningfulChange,
      primaryReason,
      whyItMovedSummary,
      explanationBullets,
      signals,
      triggeredAlerts,
      timeline,
    };
  }
}

export const changeEngine = new MeaningfulChangeEngine();
