import type { PageViewEvent, ClickEvent, RageClickEvent, DeadClickEvent } from '@causal-funnel/shared';
import { getSessionId } from './session.js';
import { getPageUrl } from './config.js';

export enum EventType {
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
  RAGE_CLICK = 'rage_click',
  DEAD_CLICK = 'dead_click',
}

export function getElementSelector(el: HTMLElement): string {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
  
  const path: string[] = [];
  let current: HTMLElement | null = el;
  
  while (current) {
    let name = current.nodeName.toLowerCase();
    if (current.id) {
      path.unshift(`#${current.id}`);
      break;
    }
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(Boolean);
      if (classes.length > 0) {
        name += '.' + classes.join('.');
      }
    }
    
    const parentEl: HTMLElement | null = current.parentElement;
    if (parentEl) {
      const siblings = Array.from(parentEl.children).filter((child: Element) => child.nodeName === current!.nodeName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        name += `:nth-of-type(${index})`;
      }
    }
    
    path.unshift(name);
    current = parentEl;
  }
  
  return path.join(' > ');
}

export function getElementText(el: HTMLElement): string {
  if (!el) return '';
  return el.textContent ? el.textContent.trim().substring(0, 100) : '';
}

export function getTagName(el: HTMLElement): string {
  if (!el) return '';
  return el.tagName ? el.tagName.toLowerCase() : '';
}

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
    pageUrl: getPageUrl(),
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
    pageUrl: getPageUrl(),
    userAgent: navigator.userAgent,
    x: clientX,
    y: clientY,
    viewportWidth,
    viewportHeight,
    xPct,
    yPct,
  };
}

/**
 * Creates a strongly typed RageClickEvent.
 */
export function createRageClickEvent(clientX: number, clientY: number, el: HTMLElement): RageClickEvent {
  if (typeof window === 'undefined') {
    throw new Error('CausalFunnel Tracker: DOM environment is required to track Rage Clicks.');
  }

  const viewportWidth = window.innerWidth || 1;
  const viewportHeight = window.innerHeight || 1;

  const xPct = Math.min(100, Math.max(0, (clientX / viewportWidth) * 100));
  const yPct = Math.min(100, Math.max(0, (clientY / viewportHeight) * 100));

  return {
    type: EventType.RAGE_CLICK,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    pageUrl: getPageUrl(),
    userAgent: navigator.userAgent,
    x: clientX,
    y: clientY,
    viewportWidth,
    viewportHeight,
    xPct,
    yPct,
    elementSelector: getElementSelector(el),
    elementText: getElementText(el),
    tagName: getTagName(el),
  };
}

/**
 * Creates a strongly typed DeadClickEvent.
 */
export function createDeadClickEvent(clientX: number, clientY: number, el: HTMLElement): DeadClickEvent {
  if (typeof window === 'undefined') {
    throw new Error('CausalFunnel Tracker: DOM environment is required to track Dead Clicks.');
  }

  return {
    type: EventType.DEAD_CLICK,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    pageUrl: getPageUrl(),
    userAgent: navigator.userAgent,
    x: clientX,
    y: clientY,
    elementSelector: getElementSelector(el),
    elementText: getElementText(el),
    tagName: getTagName(el),
  };
}

/**
 * Heuristics to determine if an element is a candidate for dead click tracking.
 * Returns false if the element (or any of its parents) is an input, button,
 * anchor, role="button", or has cursor: pointer style.
 */
export function isDeadClickCandidate(el: HTMLElement): boolean {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  
  let current: HTMLElement | null = el;
  while (current) {
    const tagName = current.tagName ? current.tagName.toLowerCase() : '';
    
    if (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      tagName === 'button' ||
      tagName === 'a'
    ) {
      return false;
    }
    
    if (current.getAttribute && current.getAttribute('role') === 'button') {
      return false;
    }
    
    if (typeof window !== 'undefined') {
      try {
        const style = window.getComputedStyle(current);
        if (style && style.cursor === 'pointer') {
          return false;
        }
      } catch (e) {
        // ignore
      }
    }
    
    current = current.parentElement;
  }
  
  return true;
}
