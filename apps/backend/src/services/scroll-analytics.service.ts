import { scrollRepository, ScrollRepository } from '../repositories/scroll.repository.js';
import { ScrollAnalyticsResponse, ScrollDropoffResponse } from '@causal-funnel/shared';

export interface ScrollExtendedAnalytics {
  totalSessions: number;
  averageDepth: number;
  deepestScrollDepth: number;
  largestDropOff: string;
  depthDistribution: {
    0: number;
    25: number;
    50: number;
    75: number;
    100: number;
  };
  dropoffSteps: ScrollDropoffResponse;
}

export class ScrollAnalyticsService {
  constructor(
    private readonly scrollRepo: ScrollRepository = scrollRepository
  ) {}

  /**
   * Computes comprehensive scroll engagement analytics for a specific page URL.
   */
  async getScrollAnalytics(pageUrl: string): Promise<ScrollExtendedAnalytics> {
    const sessionDepths = await this.scrollRepo.getSessionScrollDepth(pageUrl);
    const totalSessions = sessionDepths.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        averageDepth: 0,
        deepestScrollDepth: 0,
        largestDropOff: 'N/A',
        depthDistribution: {
          0: 0,
          25: 0,
          50: 0,
          75: 0,
          100: 0,
        },
        dropoffSteps: [
          { depth: 25, reachedBy: 0 },
          { depth: 50, reachedBy: 0 },
          { depth: 75, reachedBy: 0 },
          { depth: 100, reachedBy: 0 },
        ],
      };
    }

    // 1. Calculate count for each milestone (0, 25, 50, 75, 100)
    // A session is counted as reaching milestone M if its max scroll depth is >= M
    const count0 = sessionDepths.filter((s) => s.maxScrollDepth >= 0).length;
    const count25 = sessionDepths.filter((s) => s.maxScrollDepth >= 25).length;
    const count50 = sessionDepths.filter((s) => s.maxScrollDepth >= 50).length;
    const count75 = sessionDepths.filter((s) => s.maxScrollDepth >= 75).length;
    const count100 = sessionDepths.filter((s) => s.maxScrollDepth >= 100).length;

    // Convert counts into percentages (0 - 100)
    const pct0 = Math.round((count0 / totalSessions) * 100);
    const pct25 = Math.round((count25 / totalSessions) * 100);
    const pct50 = Math.round((count50 / totalSessions) * 100);
    const pct75 = Math.round((count75 / totalSessions) * 100);
    const pct100 = Math.round((count100 / totalSessions) * 100);

    // 2. Compute average depth
    const totalMaxDepth = sessionDepths.reduce((sum, s) => sum + s.maxScrollDepth, 0);
    const averageDepth = Math.round(totalMaxDepth / totalSessions);

    // 3. Compute deepest scroll depth
    const deepestScrollDepth = Math.max(...sessionDepths.map((s) => s.maxScrollDepth));

    // 4. Compute drop-off percentages between consecutive steps and find largest absolute drop-off
    const drops = [
      { from: '0%', to: '25%', drop: pct0 - pct25 },
      { from: '25%', to: '50%', drop: pct25 - pct50 },
      { from: '50%', to: '75%', drop: pct50 - pct75 },
      { from: '75%', to: '100%', drop: pct75 - pct100 },
    ];

    let largestDrop = drops[0];
    for (let i = 1; i < drops.length; i++) {
      if (drops[i].drop > largestDrop.drop) {
        largestDrop = drops[i];
      }
    }
    const largestDropOff = largestDrop.drop > 0 ? `${largestDrop.from} → ${largestDrop.to}` : 'None';

    return {
      totalSessions,
      averageDepth,
      deepestScrollDepth,
      largestDropOff,
      depthDistribution: {
        0: pct0,
        25: pct25,
        50: pct50,
        75: pct75,
        100: pct100,
      },
      dropoffSteps: [
        { depth: 25, reachedBy: pct25 },
        { depth: 50, reachedBy: pct50 },
        { depth: 75, reachedBy: pct75 },
        { depth: 100, reachedBy: pct100 },
      ],
    };
  }
}

export const scrollAnalyticsService = new ScrollAnalyticsService();
