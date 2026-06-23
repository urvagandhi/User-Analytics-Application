import { apiClient } from '../utils/api-client';
import { HeatmapPoint } from '@causal-funnel/shared';

/**
 * Retrieves coordinate click data for page heatmaps.
 */
export async function getHeatmapData(pageUrl: string): Promise<HeatmapPoint[]> {
  const encodedUrl = encodeURIComponent(pageUrl);
  return apiClient<HeatmapPoint[]>(`/heatmap?pageUrl=${encodedUrl}`);
}
