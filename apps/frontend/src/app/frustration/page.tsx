'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import HeatmapCanvas from '../../components/HeatmapCanvas';
import UrlSelector from '../../components/UrlSelector';
import {
  useFrustrationSummary,
  useFrustrationElements,
  useFrustrationPages,
  useFrustrationTimeline,
  useFrustrationHeatmap,
} from '../../hooks/useFrustration';
import { Frown, AlertOctagon, Layers, Award, Terminal, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';



export default function FrustrationDashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');

  // Fetch telemetry data from backend
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useFrustrationSummary();
  const { data: elements, isLoading: elementsLoading, refetch: refetchElements } = useFrustrationElements();
  const { data: pages, isLoading: pagesLoading, refetch: refetchPages } = useFrustrationPages();
  const { data: timeline, isLoading: timelineLoading, refetch: refetchTimeline } = useFrustrationTimeline();
  const { data: frustrationPoints, isLoading: heatmapLoading } = useFrustrationHeatmap(selectedUrl);

  const handleRefresh = () => {
    refetchSummary();
    refetchElements();
    refetchPages();
    refetchTimeline();
  };

  // Sync theme status on load
  useEffect(() => {
    const root = document.documentElement;
    const isLight = !root.classList.contains('dark');
    setTheme(isLight ? 'light' : 'dark');
  }, []);

  // Build URL list from dynamic pages data
  const pageUrls = Array.from(
    new Set((pages || []).map((p) => p.pageUrl))
  );

  useEffect(() => {
    if (!selectedUrl && pageUrls.length > 0) {
      setSelectedUrl(pageUrls[0]);
    }
  }, [pageUrls, selectedUrl]);

  // Map frustration heatmap points to HeatmapPoint shape (only xPct/yPct used by canvas)
  const heatmapPoints = (frustrationPoints || []).map((p) => ({
    x: 0,
    y: 0,
    xPct: p.xPct,
    yPct: p.yPct,
  }));

  const isLoading = summaryLoading || elementsLoading || pagesLoading || timelineLoading;

  // Compute severity styles
  const getSeverityBadge = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'High':
        return 'bg-accent-red-soft text-accent-red border border-accent-red/20';
      case 'Medium':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'Low':
      default:
        return 'bg-accent-green-soft text-accent-green border border-accent-green/20';
    }
  };

  // Filter elements by search query
  const filteredElements = (elements || []).filter((el) => {
    const matchesSearch =
      el.selector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.pageUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-canvas text-body font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="frustration"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar — identical props pattern as main page */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab="frustration"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">

          {isLoading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-surface-soft border border-hairline rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Visual Analytics & Trend (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Page Frustration Heatmap */}
                <div className="sketch-card p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-5 w-5 text-accent-red" />
                      <div>
                        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Page Frustration Heatmap</h3>
                        <p className="text-[10px] text-mute">Visualizing user friction hot-spots</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-accent-red/10 text-accent-red px-2 py-0.5 rounded font-mono border border-accent-red/20 font-bold">
                      {heatmapPoints.length} Spots Detected
                    </span>
                  </div>

                  <UrlSelector
                    urls={pageUrls}
                    selectedUrl={selectedUrl}
                    onSelectUrl={setSelectedUrl}
                  />

                  <div className="border border-hairline rounded overflow-hidden bg-surface-soft">
                    <HeatmapCanvas
                      points={heatmapPoints}
                      isLoading={heatmapLoading}
                      theme={theme}
                      mode="clicks"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-mute">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-accent-red" />
                        <span>Rage Click hotspots</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span>Dead Click hotspots</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono opacity-65">
                      Only frustration clicks are plotted
                    </span>
                  </div>
                </div>

                {/* Daily Trend Chart */}
                <div className="sketch-card p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-accent-blue" />
                      <div>
                        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Frustration Trend</h3>
                        <p className="text-[10px] text-mute">Daily breakdown of events</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-mute font-mono">Daily Trend</span>
                  </div>

                  {/* SVG/CSS Bar Chart */}
                  <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3 pt-6 px-2">
                    {!timeline || timeline.length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-mute text-xs">
                        <Terminal className="h-5 w-5 mb-1.5 opacity-40" />
                        <span>No data points recorded yet.</span>
                      </div>
                    ) : (
                      (() => {
                        const dateMap: Record<string, { rage: number; dead: number }> = {};
                        timeline.forEach((pt) => {
                          if (!dateMap[pt.date]) {
                            dateMap[pt.date] = { rage: 0, dead: 0 };
                          }
                          if (pt.type === 'rage_click') {
                            dateMap[pt.date].rage += pt.count;
                          } else {
                            dateMap[pt.date].dead += pt.count;
                          }
                        });

                        const entries = Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0]));
                        const maxVal = Math.max(1, ...entries.map(([_, v]) => v.rage + v.dead));

                        return entries.map(([date, counts]) => {
                          const total = counts.rage + counts.dead;
                          const deadPct = (counts.dead / maxVal) * 100;
                          const ragePct = (counts.rage / maxVal) * 100;

                          return (
                            <div key={date} className="flex-1 flex flex-col items-center group relative">
                              <div className="absolute bottom-full mb-2 bg-surface-dark border border-hairline text-on-dark text-[9px] font-mono px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-md">
                                <p className="font-bold border-b border-hairline-soft pb-0.5 mb-1 text-ink">{date}</p>
                                <p className="text-accent-red font-semibold">Rage Clicks: {counts.rage}</p>
                                <p className="text-primary font-semibold">Dead Clicks: {counts.dead}</p>
                                <p className="font-semibold text-ink border-t border-hairline-soft pt-0.5 mt-0.5">Total: {total}</p>
                              </div>

                              <div className="w-full max-w-[32px] bg-surface-soft hover:bg-hairline-soft rounded-t-xs h-36 flex flex-col justify-end overflow-hidden transition-all">
                                <div
                                  style={{ height: `${ragePct}%` }}
                                  className="w-full bg-accent-red/80 hover:bg-accent-red transition-all"
                                />
                                <div
                                  style={{ height: `${deadPct}%` }}
                                  className="w-full bg-primary/80 hover:bg-primary transition-all"
                                />
                              </div>

                              <span className="text-[8px] font-mono text-mute mt-1.5 truncate max-w-[44px]">
                                {date.substring(5)}
                              </span>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center gap-4 justify-center mt-6 border-t border-hairline pt-3 text-[10px] font-semibold text-mute">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-accent-red" />
                      <span>Rage Clicks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-primary" />
                      <span>Dead Clicks</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Score Summary & Tables (1/3 width) */}
              <div className="space-y-6">
                
                {/* Score Widget */}
                <div className="sketch-card p-5 bg-gradient-to-br from-surface-card to-surface-soft border border-hairline">
                  <span className="text-[9px] uppercase font-bold text-mute tracking-widest block">Dashboard Summary</span>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mute tracking-wider block">Frustration Score</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-4xl font-black text-ink">{summary?.score || 0}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest ${getSeverityBadge(summary?.severity || 'Low')}`}>
                        {summary?.severity || 'Low'}
                      </span>
                    </div>
                  </div>

                  {/* 3 Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-hairline">
                    <div className="text-center">
                      <span className="text-[8px] uppercase font-bold text-mute block">Rage</span>
                      <span className="text-lg font-black text-accent-red block mt-0.5">{summary?.totalRageClicks || 0}</span>
                    </div>
                    <div className="text-center border-x border-hairline">
                      <span className="text-[8px] uppercase font-bold text-mute block">Dead</span>
                      <span className="text-lg font-black text-primary block mt-0.5">{summary?.totalDeadClicks || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] uppercase font-bold text-mute block">Pages</span>
                      <span className="text-lg font-black text-accent-blue block mt-0.5">{summary?.affectedPages || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Top Frustrated Pages */}
                <div className="sketch-card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accent-blue" />
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Top Pages</h3>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px] text-left">
                      <thead>
                        <tr className="border-b border-hairline text-mute uppercase font-mono text-[8px]">
                          <th className="py-1.5 px-2 font-semibold">Route</th>
                          <th className="py-1.5 px-2 font-semibold text-center">Rage</th>
                          <th className="py-1.5 px-2 font-semibold text-center">Dead</th>
                          <th className="py-1.5 px-2 font-semibold text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-soft font-mono">
                        {!pages || pages.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-mute">No page friction.</td>
                          </tr>
                        ) : (
                          pages.slice(0, 5).map((p, idx) => (
                            <tr key={idx} className="hover:bg-surface-soft/40 transition-colors">
                              <td className="py-2 px-3 text-xs text-ink truncate max-w-[120px]" title={p.pageUrl}>
                                {p.pageUrl || '/'}
                              </td>
                              <td className="py-2 px-2 text-center text-accent-red font-bold">{p.rageClicks}</td>
                              <td className="py-2 px-2 text-center text-primary font-bold">{p.deadClicks}</td>
                              <td className="py-2 px-2 text-center text-ink font-bold">{p.rageClicks + p.deadClicks}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Frustrated Elements */}
                <div className="sketch-card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-accent-purple" />
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Top Elements</h3>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredElements.length === 0 ? (
                      <div className="py-4 text-center text-mute text-[10px]">No element friction matching filters.</div>
                    ) : (
                      filteredElements.slice(0, 6).map((el, idx) => {
                        const score = el.rageCount * 2 + el.deadCount;
                        let elementSeverity: 'Low' | 'Medium' | 'High' = 'Low';
                        if (score >= 50) elementSeverity = 'High';
                        else if (score >= 20) elementSeverity = 'Medium';

                        return (
                          <div key={idx} className="border border-hairline rounded p-2.5 space-y-1.5 hover:border-hairline-soft bg-surface-soft/20 transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-[9px] text-ink font-bold truncate block max-w-[140px]" title={el.selector}>
                                {el.selector || 'window'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${getSeverityBadge(elementSeverity)}`}>
                                {elementSeverity}
                              </span>
                            </div>
                            {el.text && (
                              <p className="text-[9px] text-mute italic truncate">
                                &quot;{el.text}&quot;
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[9px] font-mono text-mute pt-1 border-t border-hairline/40">
                              <span>Route: {el.pageUrl || '/'}</span>
                              <span className="font-bold text-ink">Score: {score} (R:{el.rageCount} D:{el.deadCount})</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
