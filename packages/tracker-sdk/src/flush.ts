import { TrackingEvent } from '@causal-funnel/shared';

/**
 * Sends a list of events to the backend endpoint.
 *
 * If isUnloading is true, it attempts to use navigator.sendBeacon
 * to ensure delivery before the page is destroyed. Otherwise, it uses fetch.
 */
export async function flushEvents(
  events: TrackingEvent[],
  endpoint: string,
  isUnloading = false
): Promise<boolean> {
  if (events.length === 0) {
    return true;
  }

  const payload = JSON.stringify(events);

  if (isUnloading && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(endpoint, blob);
      if (success) {
        return true;
      }
      // If sendBeacon fails (e.g. queue full), fallback to fetch keepalive
    } catch (e) {
      console.warn('CausalFunnel Tracker: sendBeacon failed, trying fallback keepalive fetch.', e);
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true, // Allows fetch to outlive the page destruction
    });

    return response.ok;
  } catch (error) {
    console.error('CausalFunnel Tracker: Failed to flush tracking events.', error);
    return false;
  }
}
