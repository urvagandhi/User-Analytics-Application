import { sessionRepository, SessionRepository } from '../repositories/session.repository.js';
import { eventRepository, EventRepository } from '../repositories/event.repository.js';
import { NotFoundError } from '../errors/app-error.js';
import { ISessionDocument } from '../models/session.model.js';
import { IEventDocument } from '../models/event.model.js';

export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository = sessionRepository,
    private readonly eventRepo: EventRepository = eventRepository
  ) {}

  /**
   * Retrieves a paginated list of aggregated sessions.
   */
  async listSessions(page = 1, limit = 50): Promise<ISessionDocument[]> {
    const skip = (page - 1) * limit;
    return this.sessionRepo.getSessions(limit, skip);
  }

  /**
   * Retrieves a session's details and all of its associated events sorted chronologically.
   * Throws a NotFoundError if the session does not exist.
   */
  async getSessionJourney(
    sessionId: string
  ): Promise<{ session: ISessionDocument; events: IEventDocument[] }> {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new NotFoundError(`Session with ID "${sessionId}" not found`);
    }

    const events = await this.eventRepo.findBySessionId(sessionId);
    return {
      session,
      events,
    };
  }
}

export const sessionService = new SessionService();
