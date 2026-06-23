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

  /**
   * Retrieves funnel conversion rates for the given steps by verifying strictly chronological 
   * event order using an O(n) sweep over sorted page view events.
   */
  async getFunnel(steps: string[]) {
    // 1. Fetch chronological events matching any funnel step
    const events = await this.eventRepo.getFunnelPageViews(steps);

    // 2. Track maximum funnel step reached per session
    const sessionProgress = new Map<string, number>();
    const stepRegexes = steps.map(step => new RegExp(step + '($|\\?|/)', 'i'));

    for (const event of events) {
      if (!event.pageUrl) continue;
      
      const currentStep = sessionProgress.get(event.sessionId) || 0;
      
      // If the event matches the NEXT step in this session's journey, advance their progress
      if (currentStep < steps.length && stepRegexes[currentStep].test(event.pageUrl)) {
        sessionProgress.set(event.sessionId, currentStep + 1);
      }
    }

    // 3. Aggregate survival counts
    const stepCounts = new Array(steps.length).fill(0);
    for (const progress of sessionProgress.values()) {
      for (let i = 0; i < progress; i++) {
        stepCounts[i]++;
      }
    }

    // 4. Calculate metrics
    let previousCount = stepCounts[0] || 0;
    
    return steps.map((step, index) => {
      const count = stepCounts[index] || 0;
      const dropoff = index === 0 || previousCount === 0 
        ? 0 
        : Math.round(((previousCount - count) / previousCount) * 100);
      
      const survivalRate = index === 0 || previousCount === 0
        ? 100
        : Math.round((count / previousCount) * 100);

      previousCount = count;
      return {
        step,
        count,
        dropoff,
        survivalRate,
      };
    });
  }
}

export const sessionService = new SessionService();
