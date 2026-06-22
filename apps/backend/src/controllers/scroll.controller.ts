import { Request, Response, NextFunction } from 'express';
import { scrollAnalyticsService } from '../services/scroll-analytics.service.js';

export class ScrollController {
  /**
   * Retrieves general scroll analytics (totalSessions, averageDepth, depthDistribution).
   */
  static async getScrollAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageUrl } = req.query as { pageUrl: string };
      const analytics = await scrollAnalyticsService.getScrollAnalytics(pageUrl);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves scroll drop-off funnel step percentages.
   */
  static async getScrollDropoff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageUrl } = req.query as { pageUrl: string };
      const analytics = await scrollAnalyticsService.getScrollAnalytics(pageUrl);
      
      res.status(200).json({
        success: true,
        data: analytics.dropoffSteps,
      });
    } catch (error) {
      next(error);
    }
  }
}
