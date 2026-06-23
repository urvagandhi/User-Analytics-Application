'use client';

import React, { useEffect, useState } from 'react';
import { Users, LayoutGrid, Sun, Moon, Terminal, BookOpen, X, Frown, Target } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  activeTab: 'sessions' | 'heatmap' | 'frustration' | 'live' | 'funnel';
  setActiveTab?: (tab: 'sessions' | 'heatmap' | 'frustration' | 'live' | 'funnel') => void;
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, theme, setTheme }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 md:sticky z-50 w-64 border-r border-hairline bg-canvas flex flex-col h-screen select-none transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-hairline flex items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2">
            <BrandLogo size={30} className="shiver-hover cursor-pointer" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-ink leading-tight">CausalFunnel</span>
              <span className="text-[10px] text-mute uppercase font-mono tracking-widest">Analytics Console</span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-md border border-hairline bg-surface-card hover:bg-surface-soft text-mute hover:text-ink md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-mute tracking-wider px-3 mb-2">
            Product Analytics
          </div>

          <button
            onClick={() => {
              if (pathname === '/') {
                if (setActiveTab) setActiveTab('sessions');
                window.history.pushState(null, '', '/?tab=sessions');
              } else {
                router.push('/?tab=sessions');
              }
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
              pathname === '/' && activeTab === 'sessions'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-body hover:bg-surface-soft hover:text-ink'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Sessions Explorer</span>
          </button>

          <button
            onClick={() => {
              if (pathname === '/') {
                if (setActiveTab) setActiveTab('heatmap');
                window.history.pushState(null, '', '/?tab=heatmap');
              } else {
                router.push('/?tab=heatmap');
              }
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
              pathname === '/' && activeTab === 'heatmap'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-body hover:bg-surface-soft hover:text-ink'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Visual Heatmaps</span>
          </button>

          <button
            onClick={() => {
              if (pathname === '/') {
                if (setActiveTab) setActiveTab('funnel');
                window.history.pushState(null, '', '/?tab=funnel');
              } else {
                router.push('/?tab=funnel');
              }
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
              pathname === '/' && activeTab === 'funnel'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-body hover:bg-surface-soft hover:text-ink'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Funnel Analysis</span>
          </button>

          <button
            onClick={() => {
              router.push('/frustration');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
              pathname === '/frustration'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-body hover:bg-surface-soft hover:text-ink'
            }`}
          >
            <Frown className="h-4 w-4" />
            <span>Frustration Signals</span>
          </button>

          <button
            onClick={() => {
              if (pathname === '/') {
                if (setActiveTab) setActiveTab('live');
                window.history.pushState(null, '', '/?tab=live');
              } else {
                router.push('/?tab=live');
              }
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
              pathname === '/' && activeTab === 'live'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-body hover:bg-surface-soft hover:text-ink'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Terminal className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent-red animate-pulse" />
            </div>
            <span>Live Feed</span>
          </button>

          <div className="pt-6">
            <div className="text-[10px] uppercase font-bold text-mute tracking-wider px-3 mb-2">
              Resources
            </div>
            <a 
              href={process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '/demo') : 'http://localhost:3001/demo'} 
              target="_blank"  
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-xs text-body hover:text-ink hover:bg-surface-soft rounded-md transition-all group"
            >
              <Terminal className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>Live SDK Status</span>
              <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse ml-auto shadow-[0_0_8px_rgba(44,140,102,0.6)]" />
            </a>
          </div>
        </nav>

        {/* Footer / Theme Toggle */}
        <div className="h-14 border-t border-hairline flex items-center justify-between px-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] text-mute uppercase font-mono">v1.0.0</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-surface-soft border border-transparent hover:border-hairline text-body hover:text-ink transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Moon className="h-4 w-4 text-ink" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
