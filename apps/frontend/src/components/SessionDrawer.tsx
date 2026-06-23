'use client';

import React, { useEffect, useRef } from 'react';
import { useSession } from '../hooks/useSession';
import EventTimeline from './EventTimeline';
import {
  X,
  Calendar,
  Cpu,
  RefreshCw,
  Clock,
  Layers,
  MousePointer,
  Flame,
  HelpCircle,
  TrendingDown,
  Monitor,
  Zap,
  Award,
  Frown,
  Activity,
  AlertTriangle,
  Search
} from 'lucide-react';

interface SessionDrawerProps {
  sessionId: string | null;
  onClose: () => void;
}

// Helper to parse OS and Browser from User Agent
function parseUserAgent(ua: string) {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (!ua) return { browser, os };

  const uaLower = ua.toLowerCase();

  // Browser check
  if (uaLower.includes('firefox')) {
    browser = 'Firefox';
  } else if (uaLower.includes('chrome') && !uaLower.includes('chromium')) {
    browser = 'Chrome';
  } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
    browser = 'Safari';
  } else if (uaLower.includes('edge') || uaLower.includes('edg')) {
    browser = 'Edge';
  } else if (uaLower.includes('chromium')) {
    browser = 'Chromium';
  } else if (uaLower.includes('opr') || uaLower.includes('opera')) {
    browser = 'Opera';
  }

  // OS check
  if (uaLower.includes('win')) {
    os = 'Windows';
  } else if (uaLower.includes('mac')) {
    os = 'macOS';
  } else if (uaLower.includes('linux')) {
    os = 'Linux';
  } else if (uaLower.includes('android')) {
    os = 'Android';
  } else if (uaLower.includes('iphone') || uaLower.includes('ipad')) {
    os = 'iOS';
  }

  return { browser, os };
}

// Helper to format duration in MM:SS or HH:MM:SS
const formatDuration = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000);
  if (totalSecs <= 0) return '0s';
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

// Helper to format absolute timestamps
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Helper to calculate page times
const computePageTimes = (events: any[]) => {
  const pageTimes: Record<string, { durationMs: number; lastTimestamp: number; startTimestamp: number; eventCount: number; maxScroll: number }> = {};
  
  // Sort events chronologically
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  
  let currentPage: string | null = null;
  let pageStartTime: number = 0;
  
  sorted.forEach((evt, idx) => {
    const page = evt.pageUrl;
    if (!pageTimes[page]) {
      pageTimes[page] = { durationMs: 0, lastTimestamp: evt.timestamp, startTimestamp: evt.timestamp, eventCount: 0, maxScroll: 0 };
    }
    pageTimes[page].eventCount += 1;
    if (evt.eventType === 'scroll' && evt.scrollDepth !== undefined) {
      pageTimes[page].maxScroll = Math.max(pageTimes[page].maxScroll, evt.scrollDepth);
    }
    
    // If page changes or it's the last event
    if (currentPage !== page) {
      if (currentPage && pageStartTime > 0) {
        pageTimes[currentPage].durationMs += (evt.timestamp - pageStartTime);
      }
      currentPage = page;
      pageStartTime = evt.timestamp;
    }
    
    if (idx === sorted.length - 1 && currentPage) {
      pageTimes[currentPage].durationMs += Math.max(1000, evt.timestamp - pageStartTime);
    }
  });

  return pageTimes;
};

// Canvas Heatmap Drawing Function
const drawMiniHeatmap = (canvas: HTMLCanvasElement, clicks: any[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background Web Page Wireframe Blueprint
  ctx.fillStyle = '#fcfcfa';
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = '#e5e7e0';
  ctx.fillRect(0, 0, width, 25);
  ctx.strokeStyle = '#bfc1b7';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, 25);

  // Header logo
  ctx.fillStyle = '#6c6e63';
  ctx.fillRect(10, 8, 25, 9);

  // Header links
  ctx.fillStyle = '#b6b7af';
  ctx.fillRect(width - 90, 10, 18, 5);
  ctx.fillRect(width - 65, 10, 18, 5);
  ctx.fillRect(width - 40, 10, 15, 5);

  // Hero section box
  ctx.fillStyle = '#f2f3ee';
  ctx.fillRect(15, 35, width - 30, 50);

  // Title text placeholder
  ctx.fillStyle = '#bfc1b7';
  ctx.fillRect(25, 45, 120, 8);
  ctx.fillRect(25, 60, 160, 5);
  ctx.fillRect(25, 70, 80, 5);

  // Multi-column cards
  const colWidth = (width - 40) / 3;
  ctx.fillStyle = '#e5e7e0';
  ctx.fillRect(10, 95, colWidth, 60);
  ctx.fillRect(10 + colWidth + 10, 95, colWidth, 60);
  ctx.fillRect(10 + (colWidth + 10) * 2, 95, colWidth, 60);

  // Main body paragraphs
  ctx.fillStyle = '#bfc1b7';
  ctx.fillRect(10, 165, width - 20, 5);
  ctx.fillRect(10, 175, width - 40, 5);
  ctx.fillRect(10, 185, width - 20, 5);
  ctx.fillRect(10, 195, width - 80, 5);

  // Draw clicks with soft radial gradients representing density and urgency
  clicks.forEach((clk) => {
    if (clk.xPct === undefined || clk.yPct === undefined) return;

    // Convert percentages to absolute pixels
    const pxX = (clk.xPct / 100) * width;
    const pxY = (clk.yPct / 100) * height;

    const isRage = clk.eventType === 'rage_click';
    
    // Draw outer glow
    const grad = ctx.createRadialGradient(pxX, pxY, 2, pxX, pxY, 16);
    if (isRage) {
      grad.addColorStop(0, 'rgba(205, 66, 57, 0.7)');
      grad.addColorStop(1, 'rgba(205, 66, 57, 0)');
      ctx.fillStyle = grad;
    } else {
      grad.addColorStop(0, 'rgba(247, 165, 1, 0.7)');
      grad.addColorStop(1, 'rgba(247, 165, 1, 0)');
      ctx.fillStyle = grad;
    }

    ctx.beginPath();
    ctx.arc(pxX, pxY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw center core
    ctx.beginPath();
    ctx.arc(pxX, pxY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = isRage ? '#cd4239' : '#f7a501';
    ctx.fill();
  });
};

// Session Mini Heatmap Subcomponent
function SessionMiniHeatmap({ events }: { events: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const clicks = events.filter(
    (e) => e.eventType === 'click' || e.eventType === 'rage_click' || e.eventType === 'dead_click'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMiniHeatmap(canvas, clicks);
  }, [clicks]);

  if (clicks.length <= 5) {
    return (
      <div className="sketch-card p-4 text-center">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 text-left">Session Heatmap</h3>
        <div className="py-6 text-xs text-mute font-mono border border-dashed border-hairline rounded bg-surface-soft/10">
          Not enough click data to render heatmap.
        </div>
      </div>
    );
  }

  return (
    <div className="sketch-card p-4 space-y-2.5">
      <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center justify-between">
        <span>Session Clicks Heatmap</span>
        <span className="text-[9px] text-mute font-mono normal-case">{clicks.length} clicks</span>
      </h3>
      <div className="relative rounded-md border border-hairline overflow-hidden bg-surface-doc aspect-[16/10] max-w-md mx-auto">
        <canvas
          ref={canvasRef}
          width={400}
          height={250}
          className="w-full h-full block"
        />
      </div>
      <p className="text-[10px] text-mute leading-normal">
        Orange indicates standard clicks; red highlights rage clicks indicating frustration hot spots.
      </p>
    </div>
  );
}

// Session Statistics Subcomponent
function SessionStats({ events, pagesVisited }: { events: any[]; pagesVisited: string[] }) {
  const clickEvents = events
    .filter((e) => e.eventType === 'click' || e.eventType === 'rage_click' || e.eventType === 'dead_click')
    .sort((a, b) => a.timestamp - b.timestamp);

  // 1. Average click interval
  let avgClickInterval = 'N/A';
  if (clickEvents.length > 1) {
    let sumInterval = 0;
    for (let i = 1; i < clickEvents.length; i++) {
      sumInterval += clickEvents[i].timestamp - clickEvents[i - 1].timestamp;
    }
    const avgMs = sumInterval / (clickEvents.length - 1);
    avgClickInterval = `${(avgMs / 1000).toFixed(1)}s`;
  }

  // 2. Average scroll depth
  const scrollEvents = events.filter((e) => e.eventType === 'scroll');
  const avgScrollDepth =
    scrollEvents.length > 0
      ? `${Math.round(
          scrollEvents.reduce((acc, curr) => acc + (curr.scrollDepth ?? 0), 0) / scrollEvents.length
        )}%`
      : '0%';

  // 3. Time spent per page proportions
  const pageStats = computePageTimes(events);
  const totalDuration = Object.values(pageStats).reduce((acc, curr) => acc + curr.durationMs, 0);

  // 4. Event distribution
  const counts = {
    page_view: events.filter((e) => e.eventType === 'page_view').length,
    click: events.filter((e) => e.eventType === 'click').length,
    rage_click: events.filter((e) => e.eventType === 'rage_click').length,
    dead_click: events.filter((e) => e.eventType === 'dead_click').length,
    scroll: events.filter((e) => e.eventType === 'scroll').length,
  };
  const totalEvents = events.length;

  return (
    <div className="sketch-card p-4 space-y-4">
      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Session Statistics</h3>
      
      {/* 2-column metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded bg-surface-soft/40 border border-hairline-soft">
          <span className="text-[9px] text-mute uppercase font-mono block">Avg. Click Interval</span>
          <span className="text-sm font-bold text-ink font-mono">{avgClickInterval}</span>
        </div>
        <div className="p-2.5 rounded bg-surface-soft/40 border border-hairline-soft">
          <span className="text-[9px] text-mute uppercase font-mono block">Avg. Scroll Depth</span>
          <span className="text-sm font-bold text-ink font-mono">{avgScrollDepth}</span>
        </div>
      </div>

      {/* Time spent per page bar graph */}
      {totalDuration > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-mute uppercase font-mono block">Time Spent Per Page</span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {Object.entries(pageStats).map(([url, stats]) => {
              const pct = totalDuration > 0 ? (stats.durationMs / totalDuration) * 100 : 0;
              return (
                <div key={url} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-mono text-ink truncate max-w-[170px] sm:max-w-xs" title={url}>
                      {url.replace('http://localhost:3000', '') || '/'}
                    </span>
                    <span className="font-bold text-mute">{formatDuration(stats.durationMs)}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-soft border border-hairline-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-link-teal rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event distribution bar chart */}
      {totalEvents > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-mute uppercase font-mono block">Event Distribution</span>
          <div className="flex h-4 rounded-md overflow-hidden border border-hairline">
            {counts.page_view > 0 && (
              <div
                style={{ width: `${(counts.page_view / totalEvents) * 100}%` }}
                className="bg-accent-blue opacity-80 hover:opacity-100 transition-colors"
                title={`Page Views: ${counts.page_view}`}
              />
            )}
            {counts.click > 0 && (
              <div
                style={{ width: `${(counts.click / totalEvents) * 100}%` }}
                className="bg-primary opacity-80 hover:opacity-100 transition-colors"
                title={`Clicks: ${counts.click}`}
              />
            )}
            {counts.rage_click > 0 && (
              <div
                style={{ width: `${(counts.rage_click / totalEvents) * 100}%` }}
                className="bg-accent-red opacity-80 hover:opacity-100 transition-colors"
                title={`Rage Clicks: ${counts.rage_click}`}
              />
            )}
            {counts.dead_click > 0 && (
              <div
                style={{ width: `${(counts.dead_click / totalEvents) * 100}%` }}
                className="bg-accent-purple opacity-80 hover:opacity-100 transition-colors"
                title={`Dead Clicks: ${counts.dead_click}`}
              />
            )}
            {counts.scroll > 0 && (
              <div
                style={{ width: `${(counts.scroll / totalEvents) * 100}%` }}
                className="bg-accent-green opacity-80 hover:opacity-100 transition-colors"
                title={`Scrolls: ${counts.scroll}`}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] font-mono text-mute">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" /> PV: {counts.page_view}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> CLK: {counts.click}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-red" /> RC: {counts.rage_click}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-purple" /> DC: {counts.dead_click}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" /> SCR: {counts.scroll}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionDrawer({ sessionId, onClose }: SessionDrawerProps) {
  const isOpen = !!sessionId;
  const { data, isLoading, error, refetch } = useSession(sessionId || '');

  if (!isOpen) return null;

  // Process data after fetch succeeds
  let durationMs = 0;
  let browser = 'Unknown';
  let os = 'Unknown';
  let maxScroll = 0;
  let clicksCount = 0;
  let rageClicksCount = 0;
  let deadClicksCount = 0;
  let pagesVisitedCount = 0;
  let viewportSize = 'Unknown';
  const insights: { type: 'success' | 'warning' | 'info'; text: string }[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';

  if (data) {
    const started = new Date(data.session.startedAt).getTime();
    const ended = new Date(data.session.lastSeen).getTime();
    durationMs = Math.max(0, ended - started);

    const parsedUA = parseUserAgent(data.session.userAgent);
    browser = parsedUA.browser;
    os = parsedUA.os;

    const scrollEvents = data.events.filter((e) => e.eventType === 'scroll');
    maxScroll = scrollEvents.length > 0 ? Math.max(...scrollEvents.map((e) => e.scrollDepth ?? 0)) : 0;

    clicksCount = data.events.filter((e) => e.eventType === 'click').length;
    rageClicksCount = data.events.filter((e) => e.eventType === 'rage_click').length;
    deadClicksCount = data.events.filter((e) => e.eventType === 'dead_click').length;
    pagesVisitedCount = data.session.pagesVisited.length;

    // Viewport Size
    const viewportEvent = data.events.find((e) => e.viewportWidth && e.viewportHeight);
    if (viewportEvent) {
      viewportSize = `${viewportEvent.viewportWidth} × ${viewportEvent.viewportHeight}`;
    }

    // Build insights
    const pageStats = computePageTimes(data.events);

    // 1. Rage click insights
    const rageClickEvts = data.events.filter((e) => e.eventType === 'rage_click');
    rageClickEvts.forEach((evt) => {
      insights.push({
        type: 'warning',
        text: `Rage-click detected on "${evt.elementText || evt.elementSelector || 'element'}"`,
      });
    });

    // 2. Dead click insights
    const deadClickEvts = data.events.filter((e) => e.eventType === 'dead_click');
    deadClickEvts.forEach((evt) => {
      insights.push({
        type: 'warning',
        text: `Dead click detected on "${evt.elementText || evt.elementSelector || 'element'}"`,
      });
    });

    // 3. Scroll depth insights
    if (maxScroll >= 75) {
      insights.push({
        type: 'success',
        text: `User reached deep engagement: scrolled to ${maxScroll}% scroll depth`,
      });
    }

    // 4. Page time insights
    Object.entries(pageStats).forEach(([url, stats]) => {
      const pagePath = url.replace('http://localhost:3000', '') || '/';
      insights.push({
        type: 'success',
        text: `User spent ${formatDuration(stats.durationMs)} exploring page "${pagePath}"`,
      });
    });

    // 5. Frustration severity check
    const frustrationScore = rageClicksCount * 3 + deadClicksCount;
    if (frustrationScore >= 6) {
      severity = 'High';
      insights.unshift({
        type: 'warning',
        text: 'High level of user frustration detected on the interface.',
      });
    } else if (frustrationScore >= 2) {
      severity = 'Medium';
      insights.unshift({
        type: 'warning',
        text: 'Moderate friction markers observed.',
      });
    } else {
      severity = 'Low';
    }

    // Ensure we don't have empty insights
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        text: 'Session recorded with high interaction fluidity, no frustration points.',
      });
    }
  }

  const getSeverityBadge = (sev: 'Low' | 'Medium' | 'High') => {
    switch (sev) {
      case 'High':
        return 'bg-accent-red-soft text-accent-red border border-accent-red/20';
      case 'Medium':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'Low':
      default:
        return 'bg-accent-green-soft text-accent-green border border-accent-green/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="w-screen max-w-md md:max-w-5xl bg-canvas border-l border-hairline flex flex-col h-full shadow-2xl relative z-50 animate-in slide-in-from-right duration-250">
        
        {/* Sticky Header */}
        <div className="p-4 border-b border-hairline bg-surface-soft/20 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div>
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              Session Explorer Details
            </h2>
            <p className="text-[10px] text-mute font-mono mt-0.5 break-all select-all">
              Session ID: {sessionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-hairline bg-surface-card hover:bg-surface-soft text-mute hover:text-ink transition-colors"
            title="Close Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sticky Metrics Header Bar */}
        {data && (
          <div className="bg-canvas border-b border-hairline p-3 sticky top-[57px] z-25 shadow-sm">
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 text-center">
              {/* Duration */}
              <div className="p-1.5 rounded bg-surface-card border border-hairline">
                <span className="text-[8px] text-mute uppercase font-mono block">Duration</span>
                <span className="text-xs font-bold text-ink font-mono block mt-0.5 truncate">
                  {formatDuration(durationMs)}
                </span>
              </div>
              {/* Total Events */}
              <div className="p-1.5 rounded bg-surface-card border border-hairline">
                <span className="text-[8px] text-mute uppercase font-mono block">Events</span>
                <span className="text-xs font-bold text-ink font-mono block mt-0.5">
                  {data.session.totalEvents}
                </span>
              </div>
              {/* Pages Visited */}
              <div className="p-1.5 rounded bg-surface-card border border-hairline">
                <span className="text-[8px] text-mute uppercase font-mono block">Pages</span>
                <span className="text-xs font-bold text-ink font-mono block mt-0.5">
                  {pagesVisitedCount}
                </span>
              </div>
              {/* Total Clicks */}
              <div className="p-1.5 rounded bg-surface-card border border-hairline">
                <span className="text-[8px] text-mute uppercase font-mono block">Clicks</span>
                <span className="text-xs font-bold text-ink font-mono block mt-0.5">
                  {clicksCount}
                </span>
              </div>
              {/* Max Scroll Depth */}
              <div className="p-1.5 rounded bg-surface-card border border-hairline">
                <span className="text-[8px] text-mute uppercase font-mono block">Max Scroll</span>
                <span className="text-xs font-bold text-ink font-mono block mt-0.5">
                  {maxScroll}%
                </span>
              </div>
              {/* Rage Clicks */}
              <div className={`p-1.5 rounded border ${
                rageClicksCount > 0 
                  ? 'bg-accent-red-soft/20 border-accent-red/30' 
                  : 'bg-surface-card border-hairline'
              }`}>
                <span className={`text-[8px] uppercase font-mono block ${rageClicksCount > 0 ? 'text-accent-red font-bold' : 'text-mute'}`}>Rage Clicks</span>
                <span className={`text-xs font-bold font-mono block mt-0.5 ${rageClicksCount > 0 ? 'text-accent-red' : 'text-ink'}`}>
                  {rageClicksCount}
                </span>
              </div>
              {/* Dead Clicks */}
              <div className={`p-1.5 rounded border ${
                deadClicksCount > 0 
                  ? 'bg-accent-purple-soft/20 border-accent-purple/30' 
                  : 'bg-surface-card border-hairline'
              }`}>
                <span className={`text-[8px] uppercase font-mono block ${deadClicksCount > 0 ? 'text-accent-purple font-bold' : 'text-mute'}`}>Dead Clicks</span>
                <span className={`text-xs font-bold font-mono block mt-0.5 ${deadClicksCount > 0 ? 'text-accent-purple' : 'text-ink'}`}>
                  {deadClicksCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Search size={80} className="animate-pulse text-mute opacity-50" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-mute font-mono">Parsing raw event telemetry...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 border border-accent-red rounded-md bg-accent-red-soft/10 text-center flex flex-col items-center justify-center">
              <AlertTriangle size={64} className="mb-3 text-accent-red opacity-80" />
              <h4 className="text-sm font-bold text-accent-red uppercase tracking-wider">Failed to compile journey</h4>
              <p className="text-xs text-body mt-1.5 leading-relaxed">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-surface-card border border-hairline hover:bg-surface-soft text-ink rounded-md transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Sync Pipeline
              </button>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left Column: Metadata & Visuals */}
                <div className="md:col-span-2 space-y-6">
                  {/* Device and Session Metadata */}
                  <div className="sketch-card p-4 space-y-3">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 border-b border-hairline-soft pb-2">
                      <Monitor className="h-4 w-4 text-accent-blue" />
                      Device & Client Info
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-mute uppercase block">Browser</span>
                        <span className="font-bold text-ink">{browser}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-mute uppercase block">Operating System</span>
                        <span className="font-bold text-ink">{os}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-mute uppercase block">Viewport</span>
                        <span className="font-bold text-ink">{viewportSize}</span>
                      </div>
                      <div className="col-span-2 md:col-span-3 border-t border-hairline-soft/30 pt-2">
                        <span className="text-[9px] text-mute uppercase block">User Agent</span>
                        <span className="text-body break-all leading-normal">{data.session.userAgent}</span>
                      </div>
                      <div className="border-t border-hairline-soft/30 pt-2">
                        <span className="text-[9px] text-mute uppercase block">Started At</span>
                        <span className="text-ink font-semibold">{formatDate(data.session.startedAt)}</span>
                      </div>
                      <div className="border-t border-hairline-soft/30 pt-2">
                        <span className="text-[9px] text-mute uppercase block">Last Active</span>
                        <span className="text-ink font-semibold">{formatDate(data.session.lastSeen)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Session click Heatmap Canvas */}
                  <SessionMiniHeatmap events={data.events} />

                  {/* Behavioral Insights Panel */}
                  <div className="sketch-card p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-hairline-soft pb-2">
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-primary" />
                        Behavioral Insights
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-mute uppercase font-mono">Frustration</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getSeverityBadge(severity)}`}>
                          {severity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pl-1.5">
                      {insights.map((ins, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                          {ins.type === 'warning' ? (
                            <span className="text-accent-red font-bold text-[13px] leading-none">⚠</span>
                          ) : (
                            <span className="text-accent-green font-bold text-[13px] leading-none">✓</span>
                          )}
                          <span className="text-body leading-normal">{ins.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session detailed statistics */}
                  <SessionStats events={data.events} pagesVisited={data.session.pagesVisited} />
                </div>

                {/* Right Column: User Behavior Narrative (Timeline) */}
                <div className="md:col-span-3">
                  <div className="sketch-card p-5 h-full space-y-4">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 border-b border-hairline-soft pb-3">
                      <Clock className="h-4 w-4 text-primary" />
                      User Behavior Narrative
                    </h3>
                    <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                      <EventTimeline events={data.events} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
