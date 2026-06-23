import { Request, Response, NextFunction } from 'express';
import { eventService, liveEventEmitter } from '../services/event.service.js';

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

  /**
   * SSE endpoint for live event feed.
   */
  static getLiveFeed(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering if any
    res.flushHeaders();
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    const onNewEvents = (events: any[]) => {
      res.write(`data: ${JSON.stringify(events)}\n\n`);
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    };

    liveEventEmitter.on('new_events', onNewEvents);

    req.on('close', () => {
      liveEventEmitter.off('new_events', onNewEvents);
    });
  }
}
