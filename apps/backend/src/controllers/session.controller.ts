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

  /**
   * Returns funnel analysis based on provided steps.
   */
  static async getFunnel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let steps: string[] = [];
      let labels: string[] = [];

      if (req.query.steps) {
        // Expected format: ?steps=[{"label":"Homepage","url":"/$"},{"label":"Cart","url":"/cart"}]
        try {
          const parsed = JSON.parse(req.query.steps as string);
          steps = parsed.map((p: any) => p.url);
          labels = parsed.map((p: any) => p.label);
        } catch (e) {
          res.status(400).json({ success: false, error: 'Invalid steps format' });
          return;
        }
      } else {
        // Fallback default funnel matching the new Demo Store
        steps = ['/$', '/cart', '/checkout'];
        labels = ['Homepage', 'Cart', 'Checkout'];
      }

      const data = await sessionService.getFunnel(steps);

      res.status(200).json({
        success: true,
        data: data.map((d, i) => ({
          ...d,
          step: labels[i] || d.step
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
