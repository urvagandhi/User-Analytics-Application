import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/session.service.js';

export class SessionController {
  /**
   * Retrieves a paginated list of sessions.
   */
  static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as any;
      const data = await sessionService.listSessions(page, limit);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a session's user journey (metadata + timeline events).
   */
  static async getSessionJourney(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const data = await sessionService.getSessionJourney(sessionId);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
