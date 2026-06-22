import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service.js';

export class EventController {
  /**
   * Receives a batch of telemetry events.
   * Responds with 202 (Accepted) upon successful validation and processing.
   */
  static async postEventsBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.processEventBatch(req.body);
      res.status(202).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
