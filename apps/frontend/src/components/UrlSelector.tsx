'use client';

import React from 'react';
import { Globe, ChevronDown, Plus } from 'lucide-react';

interface UrlSelectorProps {
  urls: string[];
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
}

export default function UrlSelector({ urls, selectedUrl, onSelectUrl }: UrlSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-mute uppercase tracking-wider block">
        Select Target URL Path
      </label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Dropdown Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mute">
            <Globe className="h-4 w-4" />
          </div>
          <select
            value={selectedUrl}
            onChange={(e) => onSelectUrl(e.target.value)}
            className="w-full pl-9 pr-10 py-2 text-xs rounded-md border border-hairline bg-surface-card hover:bg-surface-soft/40 text-ink focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all appearance-none cursor-pointer font-mono font-medium"
          >
            {urls.length === 0 ? (
              <option value="">No pages tracked yet</option>
            ) : (
              urls.map((url, index) => (
                <option key={index} value={url}>
                  {url}
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-mute">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Text Input Container */}
        <div className="relative sm:max-w-xs w-full flex items-center">
          <input
            type="text"
            placeholder="Or input custom URL path..."
            value={selectedUrl}
            onChange={(e) => onSelectUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-hairline bg-surface-card text-ink placeholder:text-mute focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all font-mono"
          />
        </div>
      </div>
    </div>
  );
}
