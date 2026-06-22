import { z } from 'zod';

/**
 * Represents an aggregated click point on a heatmap.
 */
export const HeatmapPointSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
  count: z.number().int().positive().optional(),
});

export type HeatmapPoint = z.infer<typeof HeatmapPointSchema>;

/**
 * Heatmap dataset for a specific URL.
 */
export const HeatmapDataSchema = z.object({
  pageUrl: z.string().min(1),
  viewportWidth: z.number().positive(),
  viewportHeight: z.number().positive(),
  points: z.array(HeatmapPointSchema),
});

export type HeatmapData = z.infer<typeof HeatmapDataSchema>;
