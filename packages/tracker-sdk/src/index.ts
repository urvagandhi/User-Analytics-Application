import { pushEvent, getAndClearEvents } from './buffer.js';
import { createPageViewEvent, createClickEvent } from './events.js';
import { flushEvents } from './flush.js';
import { resetSession } from './session.js';

export interface TrackerConfig {
  endpoint: string;
  autoTrackPageViews?: boolean;
  autoTrackClicks?: boolean;
}

let config: TrackerConfig | null = null;
let isInitialized = false;
let flushIntervalId: any = null;

/**
 * Flushes all currently buffered tracking events.
 *
 * @param isUnloading Should be set to true if flushing during the page hide/unload event.
 */
export async function flush(isUnloading = false): Promise<void> {
  if (!config) {
    return;
  }

  const events = getAndClearEvents();
  if (events.length === 0) {
    return;
  }

  const success = await flushEvents(events, config.endpoint, isUnloading);
  if (!success && !isUnloading) {
    // Re-buffer the events so we can retry on the next interval
    // We put them back at the front of the queue
    events.forEach((evt) => pushEvent(evt));
  }
}

/**
 * Tracks a page view interaction.
 */
export function trackPageView(): void {
  if (!isInitialized) {
    console.warn('CausalFunnel Tracker: SDK not initialized. Call initializeTracker first.');
    return;
  }

  try {
    const event = createPageViewEvent();
    pushEvent(event, () => {
      // Trigger instant flush when batch limit is reached
      flush().catch(() => {});
    });
  } catch (error) {
    console.error('CausalFunnel Tracker: Error tracking PageView:', error);
  }
}

/**
 * Tracks a click interaction.
 *
 * Accepts either:
 * - A MouseEvent object: trackClick(event)
 * - Raw x, y coordinates: trackClick(x, y)
 */
export function trackClick(xOrEvent?: number | MouseEvent, y?: number): void {
  if (!isInitialized) {
    console.warn('CausalFunnel Tracker: SDK not initialized. Call initializeTracker first.');
    return;
  }

  try {
    let clientX = 0;
    let clientY = 0;

    if (xOrEvent instanceof MouseEvent) {
      clientX = xOrEvent.clientX;
      clientY = xOrEvent.clientY;
    } else if (typeof xOrEvent === 'number' && typeof y === 'number') {
      clientX = xOrEvent;
      clientY = y;
    } else if (typeof window !== 'undefined') {
      // If nothing is passed, use a default fallback
      clientX = 0;
      clientY = 0;
    } else {
      return; // Server-side environment fallback
    }

    const event = createClickEvent(clientX, clientY);
    pushEvent(event, () => {
      // Trigger instant flush when batch limit is reached
      flush().catch(() => {});
    });
  } catch (error) {
    console.error('CausalFunnel Tracker: Error tracking Click:', error);
  }
}

/**
 * Initializes the tracker SDK, setting up global triggers and interval timer.
 */
export function initializeTracker(userConfig: TrackerConfig): void {
  if (typeof window === 'undefined') {
    // Silent fail if in SSR/Node environment during init
    return;
  }

  if (isInitialized) {
    console.warn('CausalFunnel Tracker: SDK is already initialized.');
    return;
  }

  if (!userConfig.endpoint) {
    console.error('CausalFunnel Tracker: Initialization failed. Ingestion endpoint is required.');
    return;
  }

  config = {
    autoTrackPageViews: true,
    autoTrackClicks: true,
    ...userConfig,
  };

  isInitialized = true;

  // Set up periodic flusher (every 3000ms)
  flushIntervalId = setInterval(() => {
    flush().catch(() => {});
  }, 3000);

  // Set up unload listener to send final batch
  window.addEventListener('pagehide', () => {
    // Sync-flush during pagehide event using sendBeacon
    const events = getAndClearEvents();
    if (events.length > 0) {
      const payload = JSON.stringify(events);
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(userConfig.endpoint, blob);
    }
  });

  // Setup auto-tracking listeners if configured
  if (config.autoTrackPageViews) {
    trackPageView();
  }

  if (config.autoTrackClicks) {
    window.addEventListener('click', (e: MouseEvent) => {
      trackClick(e);
    });
  }
}

// Re-export resetSession to allow explicit session resets
export { resetSession };
export { getSessionId } from './session.js';
