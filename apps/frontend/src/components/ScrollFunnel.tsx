'use client';

import React from 'react';
import { ArrowDown, Users, ChevronDown, Percent } from 'lucide-react';

interface ScrollFunnelProps {
  distribution?: {
    0: number;
    25: number;
    50: number;
    75: number;
    100: number;
  };
  isLoading: boolean;
}

export default function ScrollFunnel({ distribution, isLoading }: ScrollFunnelProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-card border border-hairline rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-mute font-mono">Loading scroll funnel metrics...</span>
      </div>
    );
  }

  const data = distribution || {
    0: 0,
    25: 0,
    50: 0,
    75: 0,
    100: 0,
  };

  const steps = [
    { depth: 0, pct: data[0], label: 'Above Fold (Top)' },
    { depth: 25, pct: data[25], label: 'Upper Section' },
    { depth: 50, pct: data[50], label: 'Mid-Page Fold' },
    { depth: 75, pct: data[75], label: 'Lower Content' },
    { depth: 100, pct: data[100], label: 'Footer (Bottom)' },
  ];

  return (
    <div className="bg-surface-card border border-hairline rounded-md p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Scroll Drop-off Funnel</h3>
          <p className="text-[11px] text-mute">Tracking unique session reach across major page milestones.</p>
        </div>
        <Users className="h-4 w-4 text-mute" />
      </div>

      <div className="py-2 space-y-1">
        {steps.map((step, idx) => {
          const nextStep = steps[idx + 1];
          const dropOffVal = nextStep ? step.pct - nextStep.pct : 0;
          const pctValue = step.pct;

          return (
            <React.Fragment key={step.depth}>
              {/* Funnel Step Card */}
              <div className="relative group">
                <div className="flex items-center gap-4 bg-surface-soft/40 border border-hairline rounded-md p-3.5 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Progress Bar Background fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-1000 ease-out"
                    style={{ width: `${pctValue}%` }}
                  />

                  {/* Left Label */}
                  <div className="w-14 font-mono text-xs font-bold text-ink flex-shrink-0 z-10">
                    {step.depth}%
                  </div>

                  {/* Mid Content */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-ink truncate">{step.label}</span>
                      <span className="text-xs font-mono font-bold text-emerald-500">{pctValue}%</span>
                    </div>
                    {/* Visual Progress Bar track */}
                    <div className="h-1.5 w-full bg-surface-soft border border-hairline-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pctValue}%` }}
                      />
                    </div>
                  </div>

                  {/* Glass highlight hover effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Transition arrow & drop-off count */}
              {nextStep && (
                <div className="flex justify-center items-center py-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/5 border border-red-500/10 text-red-500/80 font-mono text-[10px] font-bold shadow-xs hover:bg-red-500/10 transition-colors">
                    <ArrowDown className="h-3 w-3 animate-pulse" />
                    <span>Drop-off: -{dropOffVal}%</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
