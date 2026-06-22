import { eventRepository, EventRepository } from '../repositories/event.repository.js';
import { HeatmapPoint } from '@causal-funnel/shared';

export class HeatmapService {
  constructor(private readonly eventRepo: EventRepository = eventRepository) {}

  /**
   * Retrieves click coordinates and viewport percentages for a given page URL.
   */
  async getPageHeatmap(pageUrl: string): Promise<HeatmapPoint[]> {
    const clickEvents = await this.eventRepo.findClicksByPage(pageUrl);

    // Map Mongoose documents to the typed HeatmapPoint schema
    return clickEvents.map((click) => ({
      x: click.x ?? 0,
      y: click.y ?? 0,
      xPct: click.xPct ?? 0,
      yPct: click.yPct ?? 0,
    }));
  }
}

export const heatmapService = new HeatmapService();
