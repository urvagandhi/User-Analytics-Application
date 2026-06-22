import { z } from 'zod';

/**
 * Standardized generic API response structure.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Common date range filter schema for analytics queries.
 */
export const DateRangeFilterSchema = z.object({
  startDate: z.string().datetime({ message: 'Must be a valid ISO datetime string' }).optional(),
  endDate: z.string().datetime({ message: 'Must be a valid ISO datetime string' }).optional(),
});

export type DateRangeFilter = z.infer<typeof DateRangeFilterSchema>;

/**
 * Query schema for requesting heatmap analytics.
 */
export const GetHeatmapQuerySchema = DateRangeFilterSchema.extend({
  pageUrl: z.string().min(1, 'Page URL is required'),
});

export type GetHeatmapQuery = z.infer<typeof GetHeatmapQuerySchema>;

/**
 * Aggregated analytics overview data.
 */
export const AnalyticsSummarySchema = z.object({
  totalSessions: z.number().int().nonnegative(),
  totalPageViews: z.number().int().nonnegative(),
  totalClicks: z.number().int().nonnegative(),
  averageSessionDurationMs: z.number().nonnegative(),
  topPages: z.array(
    z.object({
      pageUrl: z.string(),
      count: z.number().int().nonnegative(),
    })
  ),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
