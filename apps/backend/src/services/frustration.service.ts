import { frustrationRepository, FrustrationRepository } from '../repositories/frustration.repository.js';

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
    private readonly frustrationRepo: FrustrationRepository = frustrationRepository
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

    // Compute frustration score: (rageClicks * 2) + deadClicks
    const score = (totalRageClicks * 2) + totalDeadClicks;

    // Normalize: 0-20 -> Low, 20-50 -> Medium, 50+ -> High
    let severity: 'Low' | 'Medium' | 'High' = 'Low';
    if (score >= 50) {
      severity = 'High';
    } else if (score >= 20) {
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
   * Returns frustration event counts grouped by date for timeline charts.
   */
  async getTimeline(): Promise<any[]> {
    return this.frustrationRepo.getFrustrationTimeline();
  }
}

export const frustrationService = new FrustrationService();
