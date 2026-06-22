import { Request, Response, NextFunction } from 'express';
import { heatmapService } from '../services/heatmap.service.js';

export class HeatmapController {
  /**
   * Retrieves click coordinates grouped for a specific URL.
   */
  static async getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageUrl } = req.query as any;
      const data = await heatmapService.getPageHeatmap(pageUrl);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
