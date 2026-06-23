import { Request, Response, NextFunction } from 'express';
import { frustrationService } from '../services/frustration.service.js';

export class FrustrationController {
  /**
   * GET /api/frustration/summary
   */
  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await frustrationService.getSummary();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/frustration/elements
   */
  static async getElements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await frustrationService.getElements();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/frustration/pages
   */
  static async getPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await frustrationService.getPages();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/frustration/timeline
   */
  static async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await frustrationService.getTimeline();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/frustration/heatmap
   */
  static async getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageUrl } = req.query as any;
      const data = await frustrationService.getHeatmapPoints(pageUrl);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
