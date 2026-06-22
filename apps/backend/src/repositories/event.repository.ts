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
   */
  async findClicksByPage(pageUrl: string): Promise<IEventDocument[]> {
    return EventModel.find({ pageUrl, eventType: 'click' }).exec();
  }
}
export const eventRepository = new EventRepository();
