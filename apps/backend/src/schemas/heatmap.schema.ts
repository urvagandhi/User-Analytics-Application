import { z } from 'zod';

/**
 * Validation schema for retrieving heatmap coordinate points for a specific URL.
 */
export const GetHeatmapSchema = z.object({
  query: z.object({
    pageUrl: z.string().min(1, 'pageUrl query parameter is required'),
  }),
});

export type GetHeatmapInput = z.infer<typeof GetHeatmapSchema>;
