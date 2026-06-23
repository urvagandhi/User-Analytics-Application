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

/**
 * Scroll Analytics response schema and type.
 */
export const ScrollAnalyticsResponseSchema = z.object({
  totalSessions: z.number().int().nonnegative(),
  averageDepth: z.number().nonnegative(),
  deepestScrollDepth: z.number().nonnegative().optional(),
  largestDropOff: z.string().optional(),
  depthDistribution: z.object({
    0: z.number().nonnegative(),
    25: z.number().nonnegative(),
    50: z.number().nonnegative(),
    75: z.number().nonnegative(),
    100: z.number().nonnegative(),
  }),
  dropoffSteps: z.lazy(() => ScrollDropoffResponseSchema).optional(),
});

export type ScrollAnalyticsResponse = z.infer<typeof ScrollAnalyticsResponseSchema>;

/**
 * Scroll drop-off response schema and type.
 */
export const ScrollDropoffResponseSchema = z.array(
  z.object({
    depth: z.union([
      z.literal(25),
      z.literal(50),
      z.literal(75),
      z.literal(100),
    ]),
    reachedBy: z.number().nonnegative(),
  })
);

export type ScrollDropoffResponse = z.infer<typeof ScrollDropoffResponseSchema>;
