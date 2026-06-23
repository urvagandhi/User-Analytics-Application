'use client';

import React, { useState, useEffect } from 'react';
import { useSessions } from '../hooks/useSessions';
import { useHeatmap } from '../hooks/useHeatmap';
import { useScrollAnalytics } from '../hooks/useScrollAnalytics';
import SessionTable from '../components/SessionTable';
import SessionDrawer from '../components/SessionDrawer';
import UrlSelector from '../components/UrlSelector';
import HeatmapCanvas from '../components/HeatmapCanvas';
import ScrollFunnel from '../components/ScrollFunnel';
import Legend from '../components/Legend';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LiveFeed from '../components/LiveFeed';
import FunnelView from '../components/FunnelView';
import { ChevronLeft, ChevronRight, Filter, RefreshCw, Layers, Award, Target, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'heatmap' | 'frustration' | 'live' | 'funnel'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Theme and Responsive Navigation States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10; // 10 sessions per page for dense clean look

  // Synchronize tab from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'sessions' || tabParam === 'heatmap' || tabParam === 'frustration' || tabParam === 'live' || tabParam === 'funnel') {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Fetch Sessions Data
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useSessions(page, limit);

  const sessionsVisitedUrls = sessions?.flatMap((s) => s.pagesVisited) || [];
  const visitedUrls = Array.from(new Set(sessionsVisitedUrls));

  // Heatmap State & Fetching
  const [selectedUrl, setSelectedUrl] = useState('');
  useEffect(() => {
    if (!selectedUrl && visitedUrls.length > 0) {
      setSelectedUrl(visitedUrls[0]);
    }
  }, [visitedUrls, selectedUrl]);
  const [heatmapMode, setHeatmapMode] = useState<'clicks' | 'scroll'>('clicks');
  const { data: heatmapPoints, isLoading: heatmapLoading } = useHeatmap(selectedUrl);
  const { data: scrollData, isLoading: scrollLoading } = useScrollAnalytics(selectedUrl);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrowser, setSelectedBrowser] = useState('all');
  const [selectedOs, setSelectedOs] = useState('all');

  // Trigger initial theme checks from document class
  useEffect(() => {
    const root = document.documentElement;
    const isLight = !root.classList.contains('dark');
    setTheme(isLight ? 'light' : 'dark');
  }, []);

  const handleNextPage = () => {
    if (sessions && sessions.length === limit) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  // Perform Client-side Filtering
  const filteredSessions = (sessions || []).filter((session) => {
    // ID or General Search Match
    const matchesSearch = 
      session.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userAgent.toLowerCase().includes(searchQuery.toLowerCase());

    // Browser Type Match
    let matchesBrowser = true;
    if (selectedBrowser !== 'all') {
      const ua = session.userAgent;
      let browser = 'Unknown';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      matchesBrowser = browser.toLowerCase() === selectedBrowser.toLowerCase();
    }

    // OS Type Match
    let matchesOs = true;
    if (selectedOs !== 'all') {
      const ua = session.userAgent;
      let os = 'OS';
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Macintosh')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone')) os = 'iOS';

      matchesOs = os.toLowerCase() === selectedOs.toLowerCase();
    }

    return matchesSearch && matchesBrowser && matchesOs;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrowser('all');
    setSelectedOs('all');
  };

  // Calculate dynamic heatmap telemetry statistics
  const totalHeatmapPoints = heatmapPoints?.length || 0;

  // 1. Identify which wireframe region is most clicked (Header, content body, footer)
  let topTargetArea = 'No data';
  if (heatmapPoints && heatmapPoints.length > 0) {
    let headerCount = 0;
    let contentCount = 0;
    let footerCount = 0;
    heatmapPoints.forEach((p) => {
      if (p.yPct < 15) headerCount++;
      else if (p.yPct < 85) contentCount++;
      else footerCount++;
    });

    const maxVal = Math.max(headerCount, contentCount, footerCount);
    if (maxVal === headerCount) topTargetArea = `Header Navbar (${Math.round((headerCount / heatmapPoints.length) * 100)}%)`;
    else if (maxVal === contentCount) topTargetArea = `Content Grid (${Math.round((contentCount / heatmapPoints.length) * 100)}%)`;
    else topTargetArea = `Footer Links (${Math.round((footerCount / heatmapPoints.length) * 100)}%)`;
  }

  // 2. Identify peak coord densities by grouping within coordinates bounds
  let peakDensityScore = 0;
  if (heatmapPoints && heatmapPoints.length > 0) {
    const coordsGrid: Record<string, number> = {};
    heatmapPoints.forEach((p) => {
      const roundedX = Math.round(p.xPct / 8) * 8;
      const roundedY = Math.round(p.yPct / 8) * 8;
      const key = `${roundedX}-${roundedY}`;
      coordsGrid[key] = (coordsGrid[key] || 0) + 1;
    });
    peakDensityScore = Math.max(...Object.values(coordsGrid));
  }

  const isFiltersActive = searchQuery !== '' || selectedBrowser !== 'all' || selectedOs !== 'all';

  return (
    <div className="flex min-h-screen bg-canvas text-body font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          sessionCount={filteredSessions.length}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dashboard Content Area */}
        <main className="flex-1 p-5 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              
              {/* Filter controls row */}
              <div className="bg-surface-card border border-hairline rounded-md p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-mute font-bold uppercase tracking-wider mr-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter Sessions</span>
                  </div>

                  {/* Browser select */}
                  <select
                    value={selectedBrowser}
                    onChange={(e) => setSelectedBrowser(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-md border border-hairline bg-surface-card text-ink font-semibold focus:outline-none focus:border-accent-blue cursor-pointer"
                  >
                    <option value="all">All Browsers</option>
                    <option value="chrome">Chrome</option>
                    <option value="firefox">Firefox</option>
                    <option value="safari">Safari</option>
                    <option value="edge">Edge</option>
                  </select>

                  {/* OS select */}
                  <select
                    value={selectedOs}
                    onChange={(e) => setSelectedOs(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-md border border-hairline bg-surface-card text-ink font-semibold focus:outline-none focus:border-accent-blue cursor-pointer"
                  >
                    <option value="all">All OS Platforms</option>
                    <option value="windows">Windows</option>
                    <option value="macos">macOS</option>
                    <option value="linux">Linux</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>

                  {/* Reset Filters button */}
                  {isFiltersActive && (
                    <button
                      onClick={clearFilters}
                      className="px-2.5 py-1 text-xs rounded-md border border-accent-red-soft bg-accent-red-soft/10 text-accent-red hover:bg-accent-red-soft/20 transition-all font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-mute font-mono text-right font-medium">
                  Showing {filteredSessions.length} of {sessions?.length || 0} loaded sessions
                </div>
              </div>

              {/* Sessions Table Section */}
              {sessionsError ? (
                <div className="p-8 border border-accent-red rounded-md bg-accent-red-soft/15 text-center flex flex-col items-center justify-center">
                  <AlertTriangle size={64} className="mb-4 text-accent-red opacity-80" />
                  <h4 className="text-sm font-bold text-accent-red uppercase tracking-wider">Failed to Ingest Sessions</h4>
                  <p className="text-xs text-body mt-1 max-w-md leading-relaxed">{sessionsError.message}</p>
                  <button
                    onClick={() => refetchSessions()}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-surface-card border border-hairline hover:bg-surface-soft text-ink rounded-md transition-all"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Force Connection Retry
                  </button>
                </div>
              ) : (
                <>
                  <SessionTable
                    data={filteredSessions}
                    isLoading={sessionsLoading}
                    onSelectSession={setSelectedSessionId}
                  />

                  {/* Pagination control footer bar */}
                  {sessions && sessions.length > 0 && (
                    <div className="flex items-center justify-between border border-hairline bg-surface-card p-3 rounded-md">
                      <div className="text-[10px] text-mute font-mono">
                        Page size: {limit} items
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={page === 1}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-hairline bg-surface-soft/40 hover:bg-surface-soft text-xs text-ink disabled:opacity-40 disabled:hover:bg-surface-soft/40 transition-colors font-bold"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Prev
                        </button>
                        <span className="text-xs text-ink font-mono font-bold bg-surface-soft px-2.5 py-1 rounded-sm border border-hairline-soft">
                          {page}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={sessions.length < limit}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-hairline bg-surface-soft/40 hover:bg-surface-soft text-xs text-ink disabled:opacity-40 disabled:hover:bg-surface-soft/40 transition-colors font-bold"
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Sidebar drawer overlay */}
              <SessionDrawer
                sessionId={selectedSessionId}
                onClose={() => setSelectedSessionId(null)}
              />
            </div>
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6">
              
              {/* URL selector panel & Mode Segmented Control */}
              <div className="bg-surface-card border border-hairline rounded-md p-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                  <UrlSelector
                    urls={visitedUrls}
                    selectedUrl={selectedUrl}
                    onSelectUrl={setSelectedUrl}
                  />
                </div>
                
                {/* Segmented Control */}
                <div className="flex flex-col gap-1.5 min-w-[220px] w-full md:w-auto">
                  <label className="text-[10px] font-bold text-mute uppercase tracking-wider block">
                    Telemetry View Mode
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-md bg-surface-soft border border-hairline w-full">
                    <button
                      onClick={() => setHeatmapMode('clicks')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-sm transition-all duration-200 ${
                        heatmapMode === 'clicks'
                          ? 'bg-surface-card text-ink shadow-xs border border-hairline-soft'
                          : 'text-mute hover:text-ink'
                      }`}
                    >
                      Clicks
                    </button>
                    <button
                      onClick={() => setHeatmapMode('scroll')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-sm transition-all duration-200 ${
                        heatmapMode === 'scroll'
                          ? 'bg-surface-card text-ink shadow-xs border border-hairline-soft'
                          : 'text-mute hover:text-ink'
                      }`}
                    >
                      Scroll Depth
                    </button>
                  </div>
                </div>
              </div>

              {/* Click Mode Statistics Cards */}
              {heatmapMode === 'clicks' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stat 1: Total clicks */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-accent-blue-soft border border-accent-blue/15 flex items-center justify-center text-accent-blue flex-shrink-0">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Total Clicks Telemetry</span>
                      <span className="text-xl font-bold text-ink font-mono">{totalHeatmapPoints}</span>
                      <span className="text-[9px] text-mute font-mono block">coordinates normalized</span>
                    </div>
                  </div>

                  {/* Stat 2: Peak coordinate density */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Peak click cluster density</span>
                      <span className="text-xl font-bold text-ink font-mono">{peakDensityScore} clicks</span>
                      <span className="text-[9px] text-mute font-mono block">highest single area hit</span>
                    </div>
                  </div>

                  {/* Stat 3: Top targeted region */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-accent-green-soft border border-accent-green/15 flex items-center justify-center text-accent-green flex-shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Top active zone</span>
                      <span className="text-sm font-bold text-ink truncate block max-w-[200px]" title={topTargetArea}>
                        {topTargetArea}
                      </span>
                      <span className="text-[9px] text-mute font-mono block">layout click mapping</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll Mode Statistics Cards */}
              {heatmapMode === 'scroll' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {/* Stat 1: Total scroll sessions */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Total Sessions</span>
                      <span className="text-xl font-bold text-ink font-mono">{scrollLoading ? '...' : scrollData?.totalSessions ?? 0}</span>
                      <span className="text-[9px] text-mute font-mono block">tracked scroll paths</span>
                    </div>
                  </div>

                  {/* Stat 2: Average Scroll Depth */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Avg. Scroll Depth</span>
                      <span className="text-xl font-bold text-ink font-mono">{scrollLoading ? '...' : `${scrollData?.averageDepth ?? 0}%`}</span>
                      <span className="text-[9px] text-mute font-mono block">mean vertical travel</span>
                    </div>
                  </div>

                  {/* Stat 3: Full Page Readers */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Full Page Readers</span>
                      <span className="text-xl font-bold text-ink font-mono">{scrollLoading ? '...' : `${scrollData?.depthDistribution?.[100] ?? 0}%`}</span>
                      <span className="text-[9px] text-mute font-mono block">reached 100% depth</span>
                    </div>
                  </div>

                  {/* Stat 4: Largest Drop-Off */}
                  <div className="bg-surface-card border border-hairline rounded-md p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 flex-shrink-0">
                      <RefreshCw className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-mute uppercase font-bold tracking-wider block">Largest Drop-Off</span>
                      <span className="text-sm font-bold text-ink block truncate max-w-[150px] font-mono mt-1" title={scrollData?.largestDropOff}>
                        {scrollLoading ? '...' : scrollData?.largestDropOff ?? 'N/A'}
                      </span>
                      <span className="text-[9px] text-mute font-mono block">biggest drop transition</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual HTML5 density canvas / Funnel container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-mute uppercase tracking-wider">
                      {heatmapMode === 'scroll' ? 'Scroll Milestone Density Bands' : 'Interactive Density Heatmap canvas'}
                    </h3>
                    <p className="text-[11px] text-mute">
                      {heatmapMode === 'scroll'
                        ? 'Visualizes the page scroll depth percentiles overlaying the wireframe layout.'
                        : 'Calculates client-side coordinate mappings normalized against core layouts.'}
                    </p>
                  </div>
                  {heatmapMode === 'clicks' && heatmapPoints && (
                    <span className="text-xs text-mute font-mono font-medium">
                      {heatmapPoints.length} points
                    </span>
                  )}
                </div>

                {heatmapMode === 'clicks' ? (
                  <HeatmapCanvas
                    points={heatmapPoints || []}
                    isLoading={heatmapLoading}
                    theme={theme}
                    mode="clicks"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    <div className="lg:col-span-2">
                      <HeatmapCanvas
                        points={[]}
                        isLoading={scrollLoading}
                        theme={theme}
                        mode="scroll"
                        scrollDistribution={scrollData?.depthDistribution}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <ScrollFunnel
                        distribution={scrollData?.depthDistribution}
                        isLoading={scrollLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color spectrum Legend key */}
              <Legend mode={heatmapMode} />
            </div>
          )}

          {/* Live Feed Tab - Kept mounted in background to maintain SSE connection */}
          <div className={activeTab === 'live' ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : "hidden"}>
            <LiveFeed />
          </div>

          {/* Funnel Analysis Tab */}
          {activeTab === 'funnel' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FunnelView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
