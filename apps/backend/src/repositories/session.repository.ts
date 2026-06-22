import { SessionModel, ISessionDocument } from '../models/session.model.js';
import { IEventDocument } from '../models/event.model.js';

export class SessionRepository {
  /**
   * Materializes and aggregates session metrics from a batch of incoming events.
   * Uses MongoDB bulkWrite with atomic operators to avoid race conditions.
   */
  async upsertSessionsFromEvents(events: Partial<IEventDocument>[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const operations = events.map((event) => {
      const eventDate = new Date(event.timestamp || Date.now());
      return {
        updateOne: {
          filter: { sessionId: event.sessionId },
          update: {
            $setOnInsert: {
              sessionId: event.sessionId,
              userAgent: event.userAgent,
            },
            $min: { startedAt: eventDate },
            $max: { lastSeen: eventDate },
            $inc: { totalEvents: 1 },
            $addToSet: { pagesVisited: event.pageUrl },
          },
          upsert: true,
        },
      };
    });

    await SessionModel.bulkWrite(operations, { ordered: false });
  }

  /**
   * Finds a session by its unique ID.
   */
  async findBySessionId(sessionId: string): Promise<ISessionDocument | null> {
    return SessionModel.findOne({ sessionId }).exec();
  }

  /**
   * Fetches a paginated list of sessions sorted by last activity time.
   */
  async getSessions(limit = 50, skip = 0): Promise<ISessionDocument[]> {
    return SessionModel.find().sort({ lastSeen: -1 }).skip(skip).limit(limit).exec();
  }
}

export const sessionRepository = new SessionRepository();
