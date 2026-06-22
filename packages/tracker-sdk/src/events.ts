import { PageViewEvent, ClickEvent, EventType } from '@causal-funnel/shared';
import { getSessionId } from './session.js';

/**
 * Creates a strongly typed PageViewEvent with current page state and session info.
 */
export function createPageViewEvent(): PageViewEvent {
  if (typeof window === 'undefined') {
    throw new Error('CausalFunnel Tracker: DOM environment is required to track Page Views.');
  }

  return {
    type: EventType.PAGE_VIEW,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
  };
}

/**
 * Creates a strongly typed ClickEvent from page coordinates and viewport sizes.
 */
export function createClickEvent(clientX: number, clientY: number): ClickEvent {
  if (typeof window === 'undefined') {
    throw new Error('CausalFunnel Tracker: DOM environment is required to track Clicks.');
  }

  const viewportWidth = window.innerWidth || 1;
  const viewportHeight = window.innerHeight || 1;

  // Clamp percentages between 0 and 100
  const xPct = Math.min(100, Math.max(0, (clientX / viewportWidth) * 100));
  const yPct = Math.min(100, Math.max(0, (clientY / viewportHeight) * 100));

  return {
    type: EventType.CLICK,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    x: clientX,
    y: clientY,
    viewportWidth,
    viewportHeight,
    xPct,
    yPct,
  };
}
