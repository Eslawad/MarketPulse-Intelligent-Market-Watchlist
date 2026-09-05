import React from 'react';
import { PricePoint } from '../types/market';

interface SparklineProps {
  data: PricePoint[] | number[];
  currentPrice: number;
  baselinePrice: number;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  currentPrice,
  baselinePrice,
  width = 110,
  height = 34,
  className = '',
}) => {
  // Extract clean number array
  const rawPrices: number[] = Array.isArray(data) && data.length > 0
    ? (typeof data[0] === 'number' ? (data as number[]) : (data as PricePoint[]).map((p) => p.price))
    : [];

  const points = [...rawPrices, currentPrice];

  if (points.length < 2) {
    return (
      <div className={`h-[34px] flex items-center text-[10px] text-slate-300 italic ${className}`}>
        No sparkline
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;

  // Padding
  const padY = 4;
  const usableHeight = height - padY * 2;
  const stepX = (width - 4) / (points.length - 1);

  const coordinates = points.map((val, idx) => {
    const x = 2 + idx * stepX;
    const y = padY + (1 - (val - min) / range) * usableHeight;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const pathD = coordinates.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${height} L ${coordinates[0].x} ${height} Z`;

  const isPositive = currentPrice >= baselinePrice;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  const lastPt = coordinates[coordinates.length - 1];

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`grad-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill={fillColor} />

      {/* Baseline reference dash */}
      <line
        x1="2"
        y1={padY + (1 - (baselinePrice - min) / range) * usableHeight}
        x2={width - 2}
        y2={padY + (1 - (baselinePrice - min) / range) * usableHeight}
        stroke="#cbd5e1"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Sparkline trend curve */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current price terminal dot */}
      <circle
        cx={lastPt.x}
        cy={lastPt.y}
        r="2.5"
        fill={strokeColor}
      />
    </svg>
  );
};
