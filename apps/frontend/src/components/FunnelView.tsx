'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Target, ArrowDown, Plus, Trash2 } from 'lucide-react';

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

  if (isLoading && funnelData.length === 0) {
    return <div className="p-8 text-center text-mute text-xs">Loading funnel analysis...</div>;
  }

  const maxCount = funnelData[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            User Journey Funnel
          </h2>
          <p className="text-xs text-mute mt-1">Configure path definitions to measure drop-off across any user journey.</p>
        </div>
        <button 
          onClick={() => isEditing ? (setIsEditing(false), fetchFunnel()) : setIsEditing(true)}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${isEditing ? 'bg-primary text-white' : 'bg-surface-card border border-hairline text-ink hover:bg-surface-soft'}`}
        >
          {isEditing ? 'Apply Changes' : 'Edit Funnel'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-surface-card border border-hairline rounded-md p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-mute mb-2">Funnel Steps Configuration</h3>
          {stepsConfig.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={step.label} 
                  onChange={(e) => handleUpdateStep(idx, 'label', e.target.value)}
                  className="w-full text-xs bg-surface-soft border border-hairline rounded-md px-3 py-2 text-ink outline-none focus:border-primary"
                  placeholder="Step Label (e.g. Homepage)"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={step.url} 
                  onChange={(e) => handleUpdateStep(idx, 'url', e.target.value)}
                  className="w-full text-xs font-mono bg-surface-soft border border-hairline rounded-md px-3 py-2 text-ink outline-none focus:border-primary"
                  placeholder="URL Path or Regex"
                />
              </div>
              <button 
                onClick={() => handleRemoveStep(idx)}
                className="p-2 text-mute hover:text-accent-red hover:bg-accent-red-soft rounded-md transition-colors"
                disabled={stepsConfig.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={handleAddStep}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors mt-2"
          >
            <Plus className="h-3 w-3" /> Add Step
          </button>
        </div>
      )}

      <div className="bg-surface-card border border-hairline rounded-md p-6 space-y-2">
        {funnelData.map((step, idx) => {
          const widthPct = Math.max(5, (step.count / maxCount) * 100);
          return (
            <React.Fragment key={step.step + idx}>
              <div className="relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-ink">{step.step}</span>
                  <span className="text-xs font-mono text-mute">{step.count} sessions</span>
                </div>
                <div className="h-10 bg-surface-soft rounded-sm overflow-hidden flex relative">
                  <div 
                    className="h-full bg-primary/80 transition-all duration-500 ease-out"
                    style={{ width: `${widthPct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-bold text-ink mix-blend-difference">{step.survivalRate}% Survival</span>
                  </div>
                </div>
              </div>

              {idx < funnelData.length - 1 && (
                <div className="flex flex-col items-center py-2 text-mute">
                  <div className="flex items-center gap-2 bg-surface-soft border border-hairline rounded-full px-3 py-1">
                    <ArrowDown className="h-3 w-3 text-accent-red" />
                    <span className="text-[10px] font-bold text-accent-red uppercase tracking-wider">{funnelData[idx + 1] ? funnelData[idx + 1].dropoff : 0}% Drop-off</span>
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
