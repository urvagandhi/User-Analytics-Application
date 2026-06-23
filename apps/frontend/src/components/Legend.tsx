'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface LegendProps {
  mode?: 'clicks' | 'scroll';
}

export default function Legend({ mode = 'clicks' }: LegendProps) {
  const isScroll = mode === 'scroll';

  return (
    <div className="bg-surface-card border border-hairline rounded-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs text-mute">
        <Info className="h-4 w-4 text-link-teal flex-shrink-0" />
        <span>
          {isScroll
            ? 'Green intensity scales with the percentage of active user sessions reaching each vertical scroll depth milestone.'
            : 'Heatmap coordinates are normalized relative to target client screen widths to ensure consistency across breakpoints.'}
        </span>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-[10px] uppercase tracking-wider text-mute font-bold font-mono">
          {isScroll ? 'Low' : 'Cold'}
        </span>
        <div
          className={`h-2.5 flex-1 md:w-48 rounded-full border border-hairline ${
            isScroll
              ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-emerald-500/90'
              : 'bg-gradient-to-r from-blue-600 via-cyan-400 via-green-400 via-yellow-300 to-red-500'
          }`}
        />
        <span className="text-[10px] uppercase tracking-wider text-mute font-bold font-mono">
          {isScroll ? '100% Reach' : 'Hot'}
        </span>
      </div>
    </div>
  );
}
