import { TrackingEventSchema, EventType } from '@causal-funnel/shared';
import { eventRepository, EventRepository } from '../repositories/event.repository.js';
import { sessionRepository, SessionRepository } from '../repositories/session.repository.js';

export class EventService {
  constructor(
    private readonly eventRepo: EventRepository = eventRepository,
    private readonly sessionRepo: SessionRepository = sessionRepository
  ) {}

  /**
   * Validates a batch of raw event payloads, filters out corrupt records,
   * calculates percentage click coordinates, and persists events and session aggregates.
   */
  async processEventBatch(rawEvents: unknown[]): Promise<{ processed: number; failed: number }> {
    const validEvents: any[] = [];
    let failedCount = 0;

    for (const raw of rawEvents) {
      const parseResult = TrackingEventSchema.safeParse(raw);
      if (!parseResult.success) {
        failedCount++;
        continue;
      }

      const event = parseResult.data;

      if (event.type === EventType.CLICK) {
        // Enforce/calculate/clamp percentage metrics to ensure mathematical consistency
        const computedXPct = event.xPct ?? (event.x / event.viewportWidth) * 100;
        const computedYPct = event.yPct ?? (event.y / event.viewportHeight) * 100;

        validEvents.push({
          sessionId: event.sessionId,
          eventType: event.type,
          pageUrl: event.pageUrl,
          timestamp: event.timestamp,
          x: event.x,
          y: event.y,
          viewportWidth: event.viewportWidth,
          viewportHeight: event.viewportHeight,
          xPct: Math.min(100, Math.max(0, computedXPct)),
          yPct: Math.min(100, Math.max(0, computedYPct)),
          userAgent: event.userAgent,
        });
      } else if (event.type === EventType.RAGE_CLICK) {
        const computedXPct = event.xPct ?? (event.x / event.viewportWidth) * 100;
        const computedYPct = event.yPct ?? (event.y / event.viewportHeight) * 100;

        validEvents.push({
          sessionId: event.sessionId,
          eventType: event.type,
          pageUrl: event.pageUrl,
          timestamp: event.timestamp,
          x: event.x,
          y: event.y,
          viewportWidth: event.viewportWidth,
          viewportHeight: event.viewportHeight,
          xPct: Math.min(100, Math.max(0, computedXPct)),
          yPct: Math.min(100, Math.max(0, computedYPct)),
          userAgent: event.userAgent,
          elementSelector: event.elementSelector,
          elementText: event.elementText,
          tagName: event.tagName,
        });
      } else if (event.type === EventType.DEAD_CLICK) {
        validEvents.push({
          sessionId: event.sessionId,
          eventType: event.type,
          pageUrl: event.pageUrl,
          timestamp: event.timestamp,
          x: event.x,
          y: event.y,
          userAgent: event.userAgent,
          elementSelector: event.elementSelector,
          elementText: event.elementText,
          tagName: event.tagName,
        });
      } else {
        // Page view event mapping
        validEvents.push({
          sessionId: event.sessionId,
          eventType: event.type,
          pageUrl: event.pageUrl,
          timestamp: event.timestamp,
          userAgent: event.userAgent,
        });
      }
    }

    if (validEvents.length > 0) {
      // Persist the append-only event records
      await this.eventRepo.insertMany(validEvents);

      // Perform atomic pre-aggregation on the session read-model
      await this.sessionRepo.upsertSessionsFromEvents(validEvents);
    }

    return {
      processed: validEvents.length,
      failed: failedCount,
    };
  }
}

export const eventService = new EventService();
