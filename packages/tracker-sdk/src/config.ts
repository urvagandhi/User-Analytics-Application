export interface TrackerConfig {
  endpoint: string;
  autoTrackPageViews?: boolean;
  autoTrackClicks?: boolean;
  overridePageUrl?: string;
}

export let activeConfig: TrackerConfig | null = null;

export function setConfig(newConfig: TrackerConfig) {
  activeConfig = newConfig;
}

export function getPageUrl(): string {
  if (activeConfig && activeConfig.overridePageUrl) {
    return activeConfig.overridePageUrl;
  }
  return typeof window !== 'undefined' ? window.location.href : '';
}

export function setPageUrlOverride(url: string) {
  if (activeConfig) {
    activeConfig.overridePageUrl = url;
  }
}
