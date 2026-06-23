import { useQuery } from '@tanstack/react-query';
import { getHeatmapData } from '../api/heatmap.api';
import { HeatmapPoint } from '@causal-funnel/shared';

/**
 * React Query hook to fetch click coordinates for render heatmaps.
 */
export function useHeatmap(pageUrl: string) {
  return useQuery<HeatmapPoint[], Error>({
    queryKey: ['heatmap', pageUrl],
    queryFn: () => getHeatmapData(pageUrl),
    enabled: !!pageUrl,
    staleTime: 30 * 1000, // 30 seconds stale time
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
    refetchInterval: 5000, // Poll every 5 seconds for real-time heatmap updates
  });
}
