import { EventModel } from '../models/event.model.js';

export class FrustrationRepository {
  /**
   * Returns the total count of rage click events.
   */
  async getRageClickSummary(): Promise<number> {
    return EventModel.countDocuments({ eventType: 'rage_click' }).exec();
  }

  /**
   * Returns the total count of dead click events.
   */
  async getDeadClickSummary(): Promise<number> {
    return EventModel.countDocuments({ eventType: 'dead_click' }).exec();
  }

  /**
   * Returns top frustrated DOM elements grouped by selector, text, and page,
   * sorted by total frustration frequency (rage + dead clicks) descending.
   */
  async getTopFrustratedElements(limit = 100): Promise<any[]> {
    return EventModel.aggregate([
      {
        $match: {
          eventType: { $in: ['rage_click', 'dead_click'] },
        },
      },
      {
        $group: {
          _id: {
            elementSelector: '$elementSelector',
            elementText: '$elementText',
            pageUrl: '$pageUrl',
          },
          rageCount: {
            $sum: { $cond: [{ $eq: ['$eventType', 'rage_click'] }, 1, 0] },
          },
          deadCount: {
            $sum: { $cond: [{ $eq: ['$eventType', 'dead_click'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          selector: { $ifNull: ['$_id.elementSelector', ''] },
          text: { $ifNull: ['$_id.elementText', ''] },
          pageUrl: { $ifNull: ['$_id.pageUrl', ''] },
          rageCount: 1,
          deadCount: 1,
          totalCount: { $add: ['$rageCount', '$deadCount'] },
        },
      },
      {
        $sort: { totalCount: -1 },
      },
      {
        $limit: limit,
      },
    ]).exec();
  }

  /**
   * Returns frustration breakdown per page.
   */
  async getPageFrustrationStats(): Promise<any[]> {
    return EventModel.aggregate([
      {
        $match: {
          eventType: { $in: ['rage_click', 'dead_click'] },
        },
      },
      {
        $group: {
          _id: '$pageUrl',
          rageClicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'rage_click'] }, 1, 0] },
          },
          deadClicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'dead_click'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          pageUrl: '$_id',
          rageClicks: 1,
          deadClicks: 1,
        },
      },
      {
        $sort: { pageUrl: 1 },
      },
    ]).exec();
  }

  /**
   * Returns frustration events grouped by date for timeline visualization.
   */
  async getFrustrationTimeline(): Promise<any[]> {
    return EventModel.aggregate([
      {
        $match: {
          eventType: { $in: ['rage_click', 'dead_click'] },
        },
      },
      {
        $project: {
          eventType: 1,
          dateStr: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $toDate: '$timestamp' },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            date: '$dateStr',
            type: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          type: '$_id.type',
          count: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).exec();
  }
}

export const frustrationRepository = new FrustrationRepository();
