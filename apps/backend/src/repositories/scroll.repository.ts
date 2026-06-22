import { EventModel, IEventDocument } from '../models/event.model.js';

export interface ScrollDistributionRaw {
  scrollDepth: number;
  count: number;
}

export interface SessionScrollDepthRaw {
  sessionId: string;
  maxScrollDepth: number;
}

export class ScrollRepository {
  /**
   * Retrieves all raw scroll events for a specific page URL.
   */
  async getScrollEvents(pageUrl: string): Promise<IEventDocument[]> {
    return EventModel.find({ pageUrl, eventType: 'scroll' }).exec();
  }

  /**
   * Aggregates scroll event counts grouped by milestone (scrollDepth) for a specific page URL,
   * counting the number of unique sessions that reached each depth.
   */
  async getScrollDistribution(pageUrl: string): Promise<ScrollDistributionRaw[]> {
    const results = await EventModel.aggregate([
      {
        $match: {
          pageUrl,
          eventType: 'scroll',
          scrollDepth: { $in: [0, 25, 50, 75, 100] },
        },
      },
      {
        $group: {
          _id: '$scrollDepth',
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          scrollDepth: '$_id',
          count: { $size: '$sessions' },
        },
      },
    ]).exec();

    return results as ScrollDistributionRaw[];
  }

  /**
   * Retrieves the maximum scroll depth achieved by each session for a specific page URL.
   */
  async getSessionScrollDepth(pageUrl: string): Promise<SessionScrollDepthRaw[]> {
    const results = await EventModel.aggregate([
      {
        $match: {
          pageUrl,
          eventType: 'scroll',
          scrollDepth: { $in: [0, 25, 50, 75, 100] },
        },
      },
      {
        $group: {
          _id: '$sessionId',
          maxScrollDepth: { $max: '$scrollDepth' },
        },
      },
      {
        $project: {
          _id: 0,
          sessionId: '$_id',
          maxScrollDepth: 1,
        },
      },
    ]).exec();

    return results as SessionScrollDepthRaw[];
  }
}

export const scrollRepository = new ScrollRepository();
