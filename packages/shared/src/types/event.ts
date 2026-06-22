import { z } from 'zod';

export enum EventType {
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
}

/**
 * Shared Base Event containing attributes gathered on every client tracking interaction.
 */
export const BaseEventSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  timestamp: z.number().int().nonnegative('Timestamp must be a positive integer'),
  pageUrl: z.string().min(1, 'Page URL is required'),
  userAgent: z.string().min(1, 'User Agent is required'),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

/**
 * Page View Event Schema and Type.
 */
export const PageViewEventSchema = BaseEventSchema.extend({
  type: z.literal(EventType.PAGE_VIEW),
});

export type PageViewEvent = z.infer<typeof PageViewEventSchema>;

/**
 * Click Event Schema and Type.
 * Captures pixel-level coordinates as well as viewport-relative percentages to facilitate accurate heatmaps.
 */
export const ClickEventSchema = BaseEventSchema.extend({
  type: z.literal(EventType.CLICK),
  x: z.number().nonnegative('X coordinate must be positive'),
  y: z.number().nonnegative('Y coordinate must be positive'),
  viewportWidth: z.number().positive('Viewport width must be greater than zero'),
  viewportHeight: z.number().positive('Viewport height must be greater than zero'),
  xPct: z.number().min(0).max(100, 'X percentage must be between 0 and 100'),
  yPct: z.number().min(0).max(100, 'Y percentage must be between 0 and 100'),
});

export type ClickEvent = z.infer<typeof ClickEventSchema>;

/**
 * Discriminated Union representing any tracking event.
 */
export const TrackingEventSchema = z.discriminatedUnion('type', [
  PageViewEventSchema,
  ClickEventSchema,
]);

export type TrackingEvent = z.infer<typeof TrackingEventSchema>;
