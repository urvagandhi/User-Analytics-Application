import { pushEvent, getAndClearEvents } from './buffer.js';
import { createPageViewEvent, createClickEvent, createRageClickEvent, createDeadClickEvent, isDeadClickCandidate, createScrollEvent } from './events.js';
import { flushEvents } from './flush.js';
import { resetSession } from './session.js';
import type { TrackerConfig } from './config.js';
import { setConfig, activeConfig, getPageUrl } from './config.js';

export type { TrackerConfig };
export { getPageUrl };

let isInitialized = false;
let flushIntervalId: any = null;

// Rage click rolling buffer
interface ClickRecord {
  element: HTMLElement;
  timestamp: number;
}
let rageClickBuffer: ClickRecord[] = [];

// Dead click pending queue
interface PendingClick {
  id: string;
  timestamp: number;
  clientX: number;
  clientY: number;
  element: HTMLElement;
  timerId: any;
}
let pendingDeadClicks: PendingClick[] = [];

// Scroll depth tracking state
let lastTrackedPageUrl = typeof window !== 'undefined' ? getPageUrl() : '';
let emittedMilestones = new Set<0 | 25 | 50 | 75 | 100>();
let isScrollHandling = false;

function handleScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const currentPageUrl = getPageUrl();
  if (currentPageUrl !== lastTrackedPageUrl) {
    lastTrackedPageUrl = currentPageUrl;
    emittedMilestones.clear();
  }

  // Clear pending dead clicks on scroll (indicates user is successfully interacting/reading)
  if (pendingDeadClicks.length > 0) {
    pendingDeadClicks.forEach((pc) => clearTimeout(pc.timerId));
    pendingDeadClicks = [];
  }

  const docElement = document.documentElement;
  const body = document.body;

  const docHeight = Math.max(
    docElement.scrollHeight,
    body.scrollHeight,
    docElement.offsetHeight,
    body.offsetHeight,
    docElement.clientHeight
  );
  
  const winHeight = window.innerHeight || docElement.clientHeight || body.clientHeight;
  const scrollTop = window.scrollY || window.pageYOffset || docElement.scrollTop || body.scrollTop || 0;

  const scrollable = docHeight - winHeight;
  let pct = 0;

  if (scrollable <= 0) {
    // Page is fully visible without scrolling
    pct = 100;
  } else {
    // If user is within 5px of the bottom, consider it 100% to account for subpixel rendering
    if (Math.ceil(scrollTop + winHeight) >= docHeight - 5) {
      pct = 100;
    } else {
      pct = (scrollTop / scrollable) * 100;
    }
  }

  const milestones: (0 | 25 | 50 | 75 | 100)[] = [0, 25, 50, 75, 100];
  for (const milestone of milestones) {
    if (pct >= milestone && !emittedMilestones.has(milestone)) {
      emittedMilestones.add(milestone);
      try {
        const scrollEvent = createScrollEvent(milestone, winHeight, docHeight);
        pushEvent(scrollEvent, () => {
          flush().catch(() => {});
        });
      } catch (err) {
        console.error('CausalFunnel Tracker: Error tracking Scroll:', err);
      }
    }
  }
}

export function setupScrollTracking(): void {
  if (typeof window === 'undefined') return;

  // Track initial scroll position on page load
  handleScroll();

  window.addEventListener(
    'scroll',
    () => {
      if (!isScrollHandling) {
        isScrollHandling = true;
        requestAnimationFrame(() => {
          handleScroll();
          isScrollHandling = false;
        });
      }
    },
    { passive: true }
  );
}

/**
 * Flushes all currently buffered tracking events.
 *
 * @param isUnloading Should be set to true if flushing during the page hide/unload event.
 */
export async function flush(isUnloading = false): Promise<void> {
  if (!activeConfig) {
    return;
  }

  const events = getAndClearEvents();
  if (events.length === 0) {
    return;
  }

  const success = await flushEvents(events, activeConfig.endpoint, isUnloading);
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

  // Clear all pending dead clicks when a page view occurs
  pendingDeadClicks.forEach((pc) => clearTimeout(pc.timerId));
  pendingDeadClicks = [];

  // Reset scroll depth tracking state on page view
  emittedMilestones.clear();
  lastTrackedPageUrl = getPageUrl();

  try {
    const event = createPageViewEvent();
    pushEvent(event, () => {
      // Trigger instant flush when batch limit is reached
      flush().catch(() => {});
    });

    // Check initial scroll on new page view
    setTimeout(() => {
      handleScroll();
    }, 100);
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
    let clickElement: HTMLElement | null = null;

    if (xOrEvent instanceof MouseEvent) {
      clientX = xOrEvent.clientX;
      clientY = xOrEvent.clientY;
      if (xOrEvent.target instanceof HTMLElement) {
        clickElement = xOrEvent.target;
      }
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

    if (clickElement) {
      const now = Date.now();

      // 1. Rage Click Detection
      rageClickBuffer.push({ element: clickElement, timestamp: now });
      const recentClicksOnElement = rageClickBuffer.filter(
        (c) => c.element === clickElement && now - c.timestamp <= 800
      );

      if (recentClicksOnElement.length >= 3) {
        try {
          const rageEvent = createRageClickEvent(clientX, clientY, clickElement);
          pushEvent(rageEvent, () => {
            flush().catch(() => {});
          });
        } catch (err) {
          console.error('CausalFunnel Tracker: Error tracking RageClick:', err);
        }
        // Avoid duplicate rage-clicks by removing current clicks for this element
        rageClickBuffer = rageClickBuffer.filter((c) => c.element !== clickElement);
      }

      // 2. Dead Click Detection
      if (!isDeadClickCandidate(clickElement)) {
        // User successfully clicked an interactive element -> clear pending dead clicks
        pendingDeadClicks.forEach((pc) => clearTimeout(pc.timerId));
        pendingDeadClicks = [];
      } else {
        // Deduplicate: do not queue multiple dead clicks for the same element within the 2s window
        const alreadyPending = pendingDeadClicks.some((pc) => pc.element === clickElement);
        
        if (!alreadyPending) {
          const pendingId = Math.random().toString();
          const timerId = setTimeout(() => {
            const idx = pendingDeadClicks.findIndex((pc) => pc.id === pendingId);
            if (idx !== -1) {
              const deadClick = pendingDeadClicks[idx];
              pendingDeadClicks.splice(idx, 1);
              try {
                const deadEvent = createDeadClickEvent(deadClick.clientX, deadClick.clientY, deadClick.element);
                pushEvent(deadEvent, () => {
                  flush().catch(() => {});
                });
              } catch (err) {
                console.error('CausalFunnel Tracker: Error tracking DeadClick:', err);
              }
            }
          }, 2000);

          pendingDeadClicks.push({
            id: pendingId,
            timestamp: now,
            clientX,
            clientY,
            element: clickElement,
            timerId,
          });
        }
      }

      // Prune old clicks from buffer to keep memory clean
      const limitTime = now - 800;
      rageClickBuffer = rageClickBuffer.filter((c) => c.timestamp >= limitTime);
    }
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

  const config = {
    autoTrackPageViews: true,
    autoTrackClicks: true,
    ...userConfig,
  };
  setConfig(config);

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

  // Setup auto scroll tracking
  setupScrollTracking();
}

// Re-export resetSession to allow explicit session resets
export { resetSession };
export { getSessionId } from './session.js';
export { setPageUrlOverride } from './config.js';
export { getQueueSize } from './buffer.js';
