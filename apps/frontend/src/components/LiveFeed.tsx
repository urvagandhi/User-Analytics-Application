'use client';

import React, { useEffect, useState } from 'react';
import { Activity, MousePointerClick, FileText, Frown, MoveDown, Globe, Radio } from 'lucide-react';

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
      case 'dead_click': return <Frown className="h-4 w-4 text-accent-purple" />;
      case 'scroll': return <MoveDown className="h-4 w-4 text-accent-green" />;
      default: return <Activity className="h-4 w-4 text-mute" />;
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type || '') {
      case 'page_view': return 'bg-accent-blue-soft text-accent-blue border border-accent-blue/20';
      case 'click': return 'bg-surface-soft text-body border border-hairline-soft';
      case 'rage_click': return 'bg-accent-red-soft text-accent-red border border-accent-red/20 shadow-[0_0_10px_rgba(205,66,57,0.2)]';
      case 'dead_click': return 'bg-accent-purple-soft text-accent-purple border border-accent-purple/20';
      case 'scroll': return 'bg-accent-green-soft text-accent-green border border-accent-green/20';
      default: return 'bg-surface-soft text-mute border border-hairline';
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

  const getStatCard = (type: string, label: string, colorClass: string, bgSoftClass: string) => (
    <div className="flex flex-col p-4 bg-canvas rounded-lg border border-hairline shadow-sm relative overflow-hidden group hover:border-hairline-soft transition-colors">
      <div className={`absolute -right-6 -top-6 w-16 h-16 rounded-full blur-2xl opacity-50 ${bgSoftClass}`}></div>
      <span className="text-[10px] uppercase font-bold text-mute tracking-widest mb-1 relative z-10">{label}</span>
      <span className={`text-2xl font-black font-mono tracking-tight relative z-10 ${colorClass}`}>
        {eventCounts[type] || 0}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Profile */}
      <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Radar wave background */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-accent-green-soft via-transparent to-transparent opacity-40 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green shadow-[0_0_8px_rgba(44,140,102,0.8)]"></span>
            </div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
              <Radio className="h-5 w-5 text-accent-green" />
              Live Telemetry Stream
            </h2>
          </div>
          <p className="text-[13px] text-mute mt-1.5 leading-relaxed max-w-lg">
            Monitor incoming events in real-time as users interact with your platform. The connection remains alive in the background.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 bg-canvas px-5 py-3 rounded-lg border border-hairline shadow-inner">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-ink font-mono leading-none">{activeSessions}</span>
            <span className="text-[10px] text-mute uppercase font-bold tracking-widest mt-1">Active Sessions</span>
          </div>
          <div className="h-10 w-px bg-hairline-soft mx-2"></div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold text-ink font-mono leading-none">{events.length}</span>
            <span className="text-[10px] text-mute uppercase font-bold tracking-widest mt-1">Events Logged</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {getStatCard('page_view', 'Page Views', 'text-accent-blue', 'bg-accent-blue')}
        {getStatCard('click', 'Clicks', 'text-ink', 'bg-charcoal')}
        {getStatCard('rage_click', 'Rage Clicks', 'text-accent-red', 'bg-accent-red')}
        {getStatCard('dead_click', 'Dead Clicks', 'text-accent-purple', 'bg-accent-purple')}
        {getStatCard('scroll', 'Scrolls', 'text-accent-green', 'bg-accent-green')}
      </div>

      {/* Stream List */}
      <div className="bg-surface-card border border-hairline rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-hairline bg-surface-soft/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-mute">Event Timeline Feed</span>
          <span className="flex items-center gap-2 text-[10px] font-mono text-mute bg-canvas px-2.5 py-1 rounded-full border border-hairline-soft">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse"></div>
            Receiving Data
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar p-2 space-y-1">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-surface-soft flex items-center justify-center border border-hairline-soft animate-bounce">
                <Radio className="h-5 w-5 text-mute opacity-50" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Waiting for incoming events</h4>
                <p className="text-xs text-mute mt-1">Open your demo environment to generate live activity.</p>
              </div>
            </div>
          ) : (
            events.map((ev, i) => (
              <div 
                key={i} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-surface-soft/60 border border-transparent hover:border-hairline transition-all duration-200 gap-3 sm:gap-4 animate-in slide-in-from-top-2"
              >
                {/* Left side: Icon, Type, Time */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className={`p-2.5 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${getEventBadgeClass(ev.eventType)}`}>
                    {getEventIcon(ev.eventType)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ink capitalize tracking-wide">
                      {(ev.eventType || '').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-mute font-mono mt-0.5">
                      {formatRelativeTime(ev.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Middle: Page URL */}
                <div className="flex-1 flex items-center gap-2 px-0 sm:px-4 text-xs font-mono text-body truncate">
                  <Globe className="h-3.5 w-3.5 text-mute flex-shrink-0" />
                  <span className="truncate" title={ev.pageUrl}>{ev.pageUrl || 'Unknown Path'}</span>
                </div>

                {/* Right side: Session ID */}
                <div className="flex items-center gap-2 text-right">
                  <div className="text-[10px] text-mute uppercase font-bold tracking-wider hidden sm:block">Session</div>
                  <div className="px-2.5 py-1 bg-canvas border border-hairline-soft rounded-md text-[11px] font-mono font-semibold text-ink shadow-sm">
                    {ev.sessionId ? `${ev.sessionId.slice(0, 8)}...` : '-'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
