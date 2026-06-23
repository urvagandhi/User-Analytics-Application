'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Target, ArrowDown, Plus, Trash2, Edit2, Check, BarChart2, Users } from 'lucide-react';

interface FunnelStep {
  step: string;
  count: number;
  dropoff: number;
  survivalRate: number;
}

interface StepConfig {
  label: string;
  url: string;
}

export default function FunnelView() {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [stepsConfig, setStepsConfig] = useState<StepConfig[]>([
    { label: 'Homepage', url: '/$' },
    { label: 'Cart', url: '/cart' },
    { label: 'Checkout', url: '/checkout' },
  ]);
  
  const [isEditing, setIsEditing] = useState(false);

  const fetchFunnel = useCallback(() => {
    setIsLoading(true);
    const query = encodeURIComponent(JSON.stringify(stepsConfig));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/funnel?steps=${query}`)
      .then((res) => res.json())
      .then((res) => {
        setFunnelData(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [stepsConfig]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  const handleUpdateStep = (index: number, field: keyof StepConfig, value: string) => {
    const newSteps = [...stepsConfig];
    newSteps[index][field] = value;
    setStepsConfig(newSteps);
  };

  const handleAddStep = () => {
    setStepsConfig([...stepsConfig, { label: 'New Step', url: '/new-path' }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...stepsConfig];
    newSteps.splice(index, 1);
    setStepsConfig(newSteps);
  };

  const maxCount = funnelData[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h2 className="text-xl font-extrabold text-ink flex items-center gap-2.5 tracking-tight">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <BarChart2 className="h-5 w-5" />
            </div>
            Conversion Funnel Analysis
          </h2>
          <p className="text-[13px] text-mute mt-1.5 max-w-lg leading-relaxed">
            Map out user journeys step-by-step to identify critical drop-off points. Optimize the path to conversion.
          </p>
        </div>
        <button 
          onClick={() => isEditing ? (setIsEditing(false), fetchFunnel()) : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 shadow-sm ${
            isEditing 
              ? 'bg-primary text-on-primary hover:opacity-90 hover:-translate-y-0.5' 
              : 'bg-surface-soft border border-hairline-soft text-ink hover:bg-surface-soft hover:-translate-y-0.5'
          }`}
        >
          {isEditing ? (
            <><Check className="h-4 w-4" /> Apply Changes</>
          ) : (
            <><Edit2 className="h-4 w-4" /> Edit Steps</>
          )}
        </button>
      </div>

      {isEditing && (
        <div className="bg-surface-card border border-hairline rounded-xl p-5 md:p-6 shadow-sm space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 border-b border-hairline-soft pb-3">
            <Target className="h-4 w-4 text-mute" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-mute">Funnel Steps Configuration</h3>
          </div>
          
          <div className="space-y-3">
            {stepsConfig.map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center group">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-surface-soft border border-hairline text-[10px] font-bold text-mute flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 w-full relative">
                  <input 
                    type="text" 
                    value={step.label} 
                    onChange={(e) => handleUpdateStep(idx, 'label', e.target.value)}
                    className="w-full text-xs bg-canvas border border-hairline rounded-md pl-3 pr-3 py-2.5 text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    placeholder="Step Label (e.g. Homepage)"
                  />
                </div>
                <div className="flex-1 w-full relative">
                  <input 
                    type="text" 
                    value={step.url} 
                    onChange={(e) => handleUpdateStep(idx, 'url', e.target.value)}
                    className="w-full text-xs font-mono bg-canvas border border-hairline rounded-md pl-3 pr-3 py-2.5 text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="URL Path or Regex"
                  />
                </div>
                <button 
                  onClick={() => handleRemoveStep(idx)}
                  className="p-2.5 text-mute hover:text-accent-red hover:bg-accent-red-soft rounded-md transition-colors border border-transparent hover:border-accent-red/20 flex-shrink-0 opacity-50 group-hover:opacity-100"
                  disabled={stepsConfig.length <= 2}
                  title="Remove Step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button 
              onClick={handleAddStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:opacity-80 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Step
            </button>
          </div>
        </div>
      )}

      {isLoading && funnelData.length === 0 ? (
        <div className="bg-surface-card border border-hairline rounded-xl p-12 flex flex-col items-center justify-center gap-4 shadow-sm min-h-[400px]">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-mute animate-pulse">Calculating funnel conversions...</span>
        </div>
      ) : (
        <div className="bg-surface-card border border-hairline rounded-xl p-6 md:p-8 shadow-sm">
          <div className="space-y-0 relative">
            {funnelData.map((step, idx) => {
              const widthPct = Math.max(2, (step.count / maxCount) * 100);
              const isLast = idx === funnelData.length - 1;
              const nextStep = funnelData[idx + 1];
              
              return (
                <div key={step.step + idx} className="relative group">
                  {/* The row */}
                  <div className="flex flex-col relative z-10">
                    <div className="flex items-end justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-surface-soft border border-hairline-soft text-[10px] font-bold text-mute shadow-sm">
                          {idx + 1}
                        </div>
                        <h3 className="text-[15px] font-extrabold text-ink tracking-tight">{step.step}</h3>
                      </div>
                      <div className="text-right flex items-end gap-3">
                        {idx > 0 && (
                          <div className="hidden sm:block text-[11px] font-medium text-mute mb-0.5">
                            <span className="text-ink font-bold">{step.survivalRate}%</span> survival
                          </div>
                        )}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-mute" />
                            <span className="text-lg font-bold text-ink font-mono leading-none">{step.count.toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-mute uppercase font-mono tracking-widest mt-1">Sessions</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual Bar Container */}
                    <div className="ml-9 flex items-center mb-1">
                      <div className="h-10 w-full bg-canvas rounded-r-lg rounded-l-sm overflow-hidden relative border border-hairline flex">
                        {/* The actual filled bar */}
                        <div 
                          className="h-full bg-primary opacity-90 transition-all duration-1000 ease-out flex items-center shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)] relative group-hover:opacity-100"
                          style={{ width: `${widthPct}%` }}
                        >
                          {/* Inner shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                          <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off visual connection */}
                  {!isLast && nextStep && (
                    <div className="ml-9 relative py-4 flex items-center">
                      {/* Connection line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-hairline-soft border-l border-dashed border-hairline opacity-50" />
                      
                      {/* Drop-off tag */}
                      <div className="flex items-center gap-4 ml-14 relative z-10 w-full">
                        <div className="flex items-center gap-1.5 bg-canvas border border-accent-red/20 rounded-full px-3 py-1 shadow-sm">
                          <ArrowDown className="h-3.5 w-3.5 text-accent-red stroke-[3]" />
                          <span className="text-[11px] font-black text-accent-red uppercase tracking-wider">{nextStep.dropoff}% Drop-off</span>
                        </div>
                        
                        <div className="h-px flex-1 bg-hairline-soft opacity-30"></div>
                        
                        <div className="text-[11px] text-mute font-mono bg-canvas px-2 rounded-md border border-hairline-soft/50 shadow-sm">
                          Lost: <span className="font-bold text-ink">{(step.count - nextStep.count).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
