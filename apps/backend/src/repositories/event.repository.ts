import { EventModel, IEventDocument } from '../models/event.model.js';

export class EventRepository {
  /**
   * Bulk inserts a list of events using unordered execution.
   * This ensures that failures in individual documents do not block the ingestion of others.
   */
  async insertMany(events: Partial<IEventDocument>[]): Promise<IEventDocument[]> {
    return EventModel.insertMany(events, { ordered: false });
  }

  /**
   * Retrieves all events associated with a specific session, sorted chronologically.
   */
  async findBySessionId(sessionId: string): Promise<IEventDocument[]> {
    return EventModel.find({ sessionId }).sort({ timestamp: 1 }).exec();
  }

  /**
   * Retrieves all click events for a page to construct heatmaps.
   * Limits to the 3000 most recent clicks to prevent memory overflow while preserving visual density.
   */
  async findClicksByPage(pageUrl: string): Promise<IEventDocument[]> {
    return EventModel.find({ pageUrl, eventType: 'click' })
      .sort({ timestamp: -1 })
      .limit(3000)
      .exec();
  }

  /**
   * Retrieves all page view events that match funnel steps, sorted chronologically.
   * Used for sequence-verified funnel analysis in the service layer.
   */
  async getFunnelPageViews(steps: string[]): Promise<IEventDocument[]> {
    return EventModel.find({ 
      eventType: 'page_view', 
      urlPath: { $in: steps }
    }).sort({ timestamp: 1 }).limit(10000).lean().exec() as unknown as IEventDocument[];
  }
}
export const eventRepository = new EventRepository();
