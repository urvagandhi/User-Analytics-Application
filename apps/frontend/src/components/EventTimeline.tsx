'use client';

import React, { useState } from 'react';
import {
  Home,
  MousePointer,
  ArrowDown,
  Flame,
  HelpCircle,
  Play,
  Square,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
  Target
} from 'lucide-react';

interface TimelineEvent {
  eventType: string;
  sessionId: string;
  timestamp: number;
  pageUrl: string;
  userAgent: string;
  x?: number;
  y?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  xPct?: number;
  yPct?: number;
  elementSelector?: string;
  elementText?: string;
  tagName?: string;
  scrollDepth?: number;
  documentHeight?: number;
  referrer?: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const [collapsedPages, setCollapsedPages] = useState<Record<number, boolean>>({});

  // 1. Sort events chronologically (earliest first)
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  const getPagePath = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  };

  const formatDuration = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    if (secs <= 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTimeOffset = (timestamp: number, baseTimestamp: number) => {
    const diffMs = timestamp - baseTimestamp;
    if (diffMs <= 0) return '0s';
    const totalSecs = Math.floor(diffMs / 1000);
    if (totalSecs < 60) return `+${totalSecs}s`;
    return `+${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s`;
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="py-12 text-center text-mute text-xs bg-surface-soft/20 border border-dashed border-hairline rounded-md">
        Session recorded but no interactions detected.
      </div>
    );
  }

  const baseTimestamp = sortedEvents[0].timestamp;

  // 2. Compute Page Durations and group events by contiguous pageUrl
  const pageGroups: {
    pageUrl: string;
    events: TimelineEvent[];
    durationMs: number;
    maxScroll: number;
  }[] = [];

  let currentGroup: typeof pageGroups[number] | null = null;
  let pageStartTime = baseTimestamp;

  sortedEvents.forEach((evt, idx) => {
    const isNewPage = !currentGroup || currentGroup.pageUrl !== evt.pageUrl;

    if (isNewPage) {
      if (currentGroup && pageGroups.length > 0) {
        // Complete the duration of previous group
        currentGroup.durationMs = evt.timestamp - pageStartTime;
      }
      pageStartTime = evt.timestamp;
      currentGroup = {
        pageUrl: evt.pageUrl,
        events: [],
        durationMs: 0,
        maxScroll: 0,
      };
      pageGroups.push(currentGroup);
    }

    currentGroup!.events.push(evt);

    if (evt.eventType === 'scroll' && evt.scrollDepth !== undefined) {
      currentGroup!.maxScroll = Math.max(currentGroup!.maxScroll, evt.scrollDepth);
    }

    // If last event, set final duration
    if (idx === sortedEvents.length - 1 && currentGroup) {
      currentGroup.durationMs = Math.max(1000, evt.timestamp - pageStartTime);
    }
  });

  const togglePage = (idx: number) => {
    setCollapsedPages((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Session Start marker */}
      <div className="flex items-center gap-3 pl-3 text-xs text-emerald-500 font-mono font-bold">
        <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <Play className="h-3 w-3 fill-emerald-500 text-emerald-500" />
        </div>
        <span>Session Started — {new Date(baseTimestamp).toLocaleTimeString()}</span>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative border-l border-hairline ml-6 pl-6 space-y-6">
        {pageGroups.map((group, pageIdx) => {
          const isCollapsed = !!collapsedPages[pageIdx];
          const pagePath = getPagePath(group.pageUrl);

          return (
            <div key={pageIdx} className="space-y-3 relative">
              {/* Timeline page hub indicator */}
              <div className="absolute -left-[37px] top-2.5 h-6 w-6 rounded-full bg-accent-blue-soft border border-accent-blue/30 text-accent-blue flex items-center justify-center z-10 shadow-sm">
                <Home className="h-3 w-3" />
              </div>

              {/* Collapsible Page Card Header */}
              <div
                onClick={() => togglePage(pageIdx)}
                className="bg-surface-card border border-hairline hover:border-accent-blue/40 rounded-md p-3 flex items-center justify-between cursor-pointer select-none transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-mute flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-mute flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-bold">GET</span>
                      <span className="text-xs font-bold text-ink font-mono truncate block" title={group.pageUrl}>
                        {pagePath}
                      </span>
                    </div>
                    <span className="text-[10px] text-mute font-mono tracking-wider block mt-0.5">Page Visit · {group.events.length} events</span>
                  </div>
                </div>

                {/* Page card stats */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-mute flex-shrink-0 ml-4">
                  <span className="flex items-center gap-1 bg-surface-soft px-1.5 py-0.5 rounded-sm">
                    <Clock className="h-3 w-3" />
                    {formatDuration(group.durationMs)}
                  </span>
                  <span className="flex items-center gap-1 bg-surface-soft px-1.5 py-0.5 rounded-sm">
                    <Layers className="h-3 w-3" />
                    {group.events.length} events
                  </span>
                  {group.maxScroll > 0 && (
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm">
                      <ArrowDown className="h-3 w-3" />
                      Scroll: {group.maxScroll}%
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Page Events List */}
              {!isCollapsed && (
                <div className="pl-2 space-y-3.5 border-l border-dashed border-hairline-soft ml-3">
                  {group.events.map((evt, evtIdx) => {
                    const eventOffset = formatTimeOffset(evt.timestamp, baseTimestamp);
                    
                    let cardAccent = 'border-hairline hover:border-primary/40';
                    let icon = <MousePointer className="h-3 w-3" />;
                    let title = 'Click';
                    let titleClass = 'text-primary';
                    let cardBody = null;
                    let severityPill: React.ReactNode = null;

                    if (evt.eventType === 'page_view') {
                      icon = <Home className="h-3 w-3" />;
                      title = 'Landed on page';
                      titleClass = 'text-accent-blue';
                      cardBody = evt.referrer ? (
                        <p className="text-[10px] text-mute mt-1 font-mono break-all">
                          Referrer: {evt.referrer}
                        </p>
                      ) : null;
                    } else if (evt.eventType === 'click') {
                      icon = <MousePointer className="h-3 w-3" />;
                      title = evt.elementText ? `Clicked "${evt.elementText}"` : 'Clicked element';
                      titleClass = 'text-accent-blue';
                      cardBody = (
                        <div className="mt-2 space-y-1.5 font-mono text-[10px] text-mute">
                          <div className="flex justify-between border-b border-hairline-soft/30 pb-1">
                            <span>Selector:</span>
                            <span className="text-ink font-semibold break-all text-right max-w-[200px]">{evt.elementSelector || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coordinates:</span>
                            <span className="text-ink font-semibold">
                              ({evt.x}px, {evt.y}px) · {evt.xPct?.toFixed(0)}% × {evt.yPct?.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    } else if (evt.eventType === 'rage_click') {
                      cardAccent = 'border-l-4 border-l-accent-red border-hairline hover:border-l-accent-red hover:border-accent-red/40 bg-accent-red/3';
                      icon = <Flame className="h-3 w-3" />;
                      title = evt.elementText ? `Rage Clicked "${evt.elementText}"` : 'Rage click detected';
                      titleClass = 'text-accent-red font-bold';
                      severityPill = <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent-red/10 text-accent-red border border-accent-red/20">High Friction</span>;
                      cardBody = (
                        <div className="mt-2 space-y-1.5 font-mono text-[10px] text-mute">
                          <div className="text-accent-red font-semibold bg-accent-red-soft/20 border border-accent-red/20 rounded p-1.5 mb-2 leading-relaxed">
                            User clicked rapidly {evt.elementText ? `on "${evt.elementText}"` : 'on element'}. Indicates user frustration.
                          </div>
                          <div className="flex justify-between border-b border-hairline-soft/30 pb-1">
                            <span>Selector:</span>
                            <span className="text-ink font-semibold break-all text-right max-w-[200px]">{evt.elementSelector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coordinates:</span>
                            <span className="text-ink font-semibold">
                              ({evt.x}px, {evt.y}px) · {evt.xPct?.toFixed(0)}% × {evt.yPct?.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    } else if (evt.eventType === 'dead_click') {
                      cardAccent = 'border-l-4 border-l-accent-purple border-hairline hover:border-l-accent-purple hover:border-accent-purple/40 bg-accent-purple/3';
                      icon = <HelpCircle className="h-3 w-3" />;
                      title = evt.elementText ? `Dead Clicked "${evt.elementText}"` : 'Dead click detected';
                      titleClass = 'text-accent-purple font-bold';
                      severityPill = <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20">No Response</span>;
                      cardBody = (
                        <div className="mt-2 space-y-1.5 font-mono text-[10px] text-mute">
                          <div className="text-accent-purple font-semibold bg-accent-purple-soft/20 border border-accent-purple/20 rounded p-1.5 mb-2 leading-relaxed">
                            No navigation or state change detected.
                          </div>
                          <div className="flex justify-between border-b border-hairline-soft/30 pb-1">
                            <span>Selector:</span>
                            <span className="text-ink font-semibold break-all text-right max-w-[200px]">{evt.elementSelector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coordinates:</span>
                            <span className="text-ink font-semibold">
                              ({evt.x}px, {evt.y}px) · {evt.xPct?.toFixed(0)}% × {evt.yPct?.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    } else if (evt.eventType === 'scroll') {
                      icon = <ArrowDown className="h-3 w-3" />;
                      title = `Scrolled ${evt.scrollDepth}%`;
                      titleClass = 'text-emerald-500 font-bold';
                      cardBody = (
                        <div className="mt-1.5 text-[10px] text-mute font-mono flex justify-between">
                          <span>Viewport / Document Height:</span>
                          <span className="text-ink">{evt.viewportHeight}px / {evt.documentHeight}px</span>
                        </div>
                      );
                    }

                    return (
                      <div key={evtIdx} className="relative pl-6 group/item animate-in fade-in duration-200">
                        {/* Bullet step marker */}
                        <div className="absolute -left-[19px] top-2 h-2.5 w-2.5 rounded-full border border-hairline bg-canvas flex items-center justify-center text-mute group-hover/item:border-primary group-hover/item:bg-primary transition-all">
                          <div className="h-1 w-1 bg-mute rounded-full group-hover/item:bg-on-primary" />
                        </div>

                        {/* Event details card */}
                        <div className={`sketch-card p-3 transition-all ${cardAccent}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${titleClass}`}>
                              {icon}
                              {title}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {severityPill}
                              <span className="text-[9px] text-mute font-mono">{eventOffset}</span>
                            </div>
                          </div>
                          {cardBody}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Session End marker */}
      <div className="flex items-center gap-3 pl-3 text-xs text-mute font-mono font-bold pt-2">
        <div className="h-6 w-6 rounded-full bg-surface-soft border border-hairline flex items-center justify-center">
          <Square className="h-2.5 w-2.5 fill-mute text-mute" />
        </div>
        <span>Session Ended — {new Date(sortedEvents[sortedEvents.length - 1].timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
