'use client';

import React from 'react';
import { Search, Activity, RefreshCw, Menu, Trash2 } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'sessions' | 'heatmap' | 'frustration' | 'live' | 'funnel';
  sessionCount?: number;
  onToggleSidebar: () => void;
}

export default function Header({ searchQuery, setSearchQuery, activeTab, sessionCount = 0, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-14 border-b border-hairline bg-canvas flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md border border-hairline bg-surface-card hover:bg-surface-soft text-mute hover:text-ink md:hidden mr-1"
          title="Open Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumbs / Page Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
          <span className="text-[10px] sm:text-xs text-mute font-medium hidden sm:inline">Console</span>
          <span className="text-[10px] sm:text-xs text-mute font-mono hidden sm:inline">/</span>
          <h1 className="text-[10px] sm:text-xs font-bold text-ink uppercase tracking-wider">
            {activeTab === 'sessions' ? 'Sessions' : activeTab === 'heatmap' ? 'Heatmaps' : activeTab === 'funnel' ? 'Funnel Analysis' : activeTab === 'live' ? 'Live Feed' : 'Frustration Signals'}
          </h1>
          {activeTab === 'sessions' && sessionCount > 0 && (
            <span className="ml-1 sm:ml-2 text-[9px] bg-accent-blue-soft text-accent-blue border border-accent-blue/15 px-2 py-0.5 rounded-full font-bold">
              {sessionCount}
            </span>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      {activeTab === 'sessions' ? (
        <div className="max-w-xs md:max-w-md w-full relative mx-2 sm:mx-4">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-mute">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            placeholder="Filter by browser, OS, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-hairline bg-surface-card text-ink placeholder:text-mute focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all font-mono"
          />
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-mute uppercase font-mono mr-2">
          <Activity className="h-3.5 w-3.5 text-accent-green" />
          <span>Ingesting</span>
        </div>
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to completely clear the database?')) {
              try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
                await fetch(`${apiBase}/reset`, { method: 'POST' });
                window.location.reload();
              } catch (e) {
                console.error(e);
              }
            }
          }}
          className="p-1.5 rounded-md bg-surface-card hover:bg-accent-red-soft border border-hairline text-accent-red transition-all"
          title="Reset Database"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 rounded-md bg-surface-card hover:bg-surface-soft border border-hairline text-mute hover:text-ink transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
