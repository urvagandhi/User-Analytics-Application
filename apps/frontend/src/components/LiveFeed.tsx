'use client';

import React, { useEffect, useState } from 'react';
import { Activity, MousePointerClick, FileText, Frown } from 'lucide-react';

interface LiveEvent {
  eventType: string;
  pageUrl?: string;
  sessionId: string;
  timestamp: number;
}

export default function LiveFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    console.log(`[LiveFeed] Connecting to SSE at ${apiBase}/live`);
    const eventSource = new EventSource(`${apiBase}/live`);
    const sessionIds = new Set<string>();

    eventSource.onopen = () => {
      console.log('[LiveFeed] SSE connection established successfully');
    };

    eventSource.onmessage = (e) => {
      try {
        const newEvents: LiveEvent[] = JSON.parse(e.data);
        console.log('[LiveFeed] Received SSE events:', newEvents);
        
        setEvents((prev) => {
          const combined = [...newEvents, ...prev];
          return combined.slice(0, 100); // Keep last 100 events
        });

        newEvents.forEach((ev) => {
          if (ev.sessionId) {
            sessionIds.add(ev.sessionId);
          }
        });
        setActiveSessions(sessionIds.size);
      } catch (err) {
        console.error('[LiveFeed] Error processing message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[LiveFeed] SSE EventSource error:', err);
    };

    return () => {
      console.log('[LiveFeed] Closing SSE connection');
      eventSource.close();
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type || '') {
      case 'page_view': return <FileText className="h-4 w-4 text-accent-blue" />;
      case 'click': return <MousePointerClick className="h-4 w-4 text-mute" />;
      case 'rage_click': return <Frown className="h-4 w-4 text-accent-red" />;
      case 'dead_click': return <Frown className="h-4 w-4 text-accent-orange" />;
      default: return <Activity className="h-4 w-4 text-mute" />;
    }
  };

  const formatRelativeTime = (ts: number) => {
    const diff = now - ts;
    if (diff < 5000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s ago`;
    return new Date(ts).toLocaleTimeString();
  };

  const eventCounts = events.reduce((acc, ev) => {
    if (ev.eventType) {
      acc[ev.eventType] = (acc[ev.eventType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const getEventBadge = (type: string, label: string, colorClass: string) => (
    <div className="flex flex-col items-center px-4 py-2 border-r border-hairline last:border-r-0">
      <span className={`text-lg font-black ${colorClass}`}>{eventCounts[type] || 0}</span>
      <span className="text-[9px] uppercase font-mono text-mute tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-surface-card border border-hairline rounded-md overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-hairline">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-green"></span>
              </span>
              Real-time Live Feed
            </h2>
            <p className="text-xs text-mute mt-1">Streaming incoming telemetry directly from the tracker</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-ink">{activeSessions}</div>
            <div className="text-xs text-mute uppercase font-mono">Active Sessions</div>
          </div>
        </div>
        {/* Event type breakdown */}
        <div className="flex divide-x divide-hairline bg-surface-soft/50">
          {getEventBadge('page_view', 'Page Views', 'text-accent-blue')}
          {getEventBadge('click', 'Clicks', 'text-body')}
          {getEventBadge('rage_click', 'Rage Clicks', 'text-accent-red')}
          {getEventBadge('dead_click', 'Dead Clicks', 'text-accent-orange')}
          {getEventBadge('scroll', 'Scrolls', 'text-accent-green')}
        </div>
      </div>

      <div className="bg-surface-card border border-hairline rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline bg-surface-soft">
              <th className="py-2 px-4 text-[10px] uppercase font-bold text-mute tracking-wider w-24">Time</th>
              <th className="py-2 px-4 text-[10px] uppercase font-bold text-mute tracking-wider">Event</th>
              <th className="py-2 px-4 text-[10px] uppercase font-bold text-mute tracking-wider">Page</th>
              <th className="py-2 px-4 text-[10px] uppercase font-bold text-mute tracking-wider text-right">Session ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-mute">
                  Waiting for incoming events... Open the demo page to see activity!
                </td>
              </tr>
            )}
            {events.map((ev, i) => (
              <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
                <td className="py-2 px-4 text-xs font-mono text-mute">{formatRelativeTime(ev.timestamp)}</td>
                <td className="py-2 px-4 text-xs font-semibold flex items-center gap-2">
                  {getEventIcon(ev.eventType)}
                  <span className="capitalize">{(ev.eventType || '').replace('_', ' ')}</span>
                </td>
                <td className="py-2 px-4 text-xs text-body truncate max-w-[200px]" title={ev.pageUrl}>
                  {ev.pageUrl || '-'}
                </td>
                <td className="py-2 px-4 text-xs font-mono text-mute text-right">
                  {ev.sessionId ? `${ev.sessionId.slice(0, 8)}...` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
