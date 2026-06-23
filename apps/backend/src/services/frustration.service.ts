import { frustrationRepository, FrustrationRepository } from '../repositories/frustration.repository.js';
import { sessionRepository, SessionRepository } from '../repositories/session.repository.js';

export interface FrustrationSummary {
  totalRageClicks: number;
  totalDeadClicks: number;
  affectedPages: number;
  score: number;
  severity: 'Low' | 'Medium' | 'High';
  topFrustratedElements: any[];
}

export class FrustrationService {
  constructor(
    private readonly frustrationRepo: FrustrationRepository = frustrationRepository,
    private readonly sessionRepo: SessionRepository = sessionRepository
  ) {}

  /**
   * Aggregates the overall frustration metrics, including total counts,
   * affected pages, top elements, and the calculated frustration score/severity.
   */
  async getSummary(): Promise<FrustrationSummary> {
    const totalRageClicks = await this.frustrationRepo.getRageClickSummary();
    const totalDeadClicks = await this.frustrationRepo.getDeadClickSummary();
    const topFrustratedElements = await this.frustrationRepo.getTopFrustratedElements(5);
    const pageStats = await this.frustrationRepo.getPageFrustrationStats();

    const affectedPages = pageStats.length;
    const totalSessions = Math.max(1, await this.sessionRepo.countSessions());

    // Compute frustration score normalized by total sessions (Frustration Events per 100 Sessions)
    const rawEvents = (totalRageClicks * 2) + totalDeadClicks;
    const score = Math.round((rawEvents / totalSessions) * 100);

    // Normalize severity based on events per 100 sessions
    let severity: 'Low' | 'Medium' | 'High' = 'Low';
    if (score >= 50) { // e.g., >= 0.5 events per session on average
      severity = 'High';
    } else if (score >= 10) { // e.g., >= 0.1 events per session
      severity = 'Medium';
    }

    return {
      totalRageClicks,
      totalDeadClicks,
      affectedPages,
      score,
      severity,
      topFrustratedElements,
    };
  }

  /**
   * Returns all frustrated elements sorted by frequency descending.
   */
  async getElements(): Promise<any[]> {
    return this.frustrationRepo.getTopFrustratedElements();
  }

  /**
   * Returns frustration breakdown per page.
   */
  async getPages(): Promise<any[]> {
    return this.frustrationRepo.getPageFrustrationStats();
  }

  /**
   * Returns xPct/yPct coordinates of frustration clicks for a specific page.
   */
  async getHeatmapPoints(pageUrl: string): Promise<any[]> {
    return this.frustrationRepo.getFrustrationHeatmapPoints(pageUrl);
  }

  /**
   * Returns frustration event counts grouped by date for timeline charts.
   */
  async getTimeline(): Promise<any[]> {
    return this.frustrationRepo.getFrustrationTimeline();
  }
}

export const frustrationService = new FrustrationService();
