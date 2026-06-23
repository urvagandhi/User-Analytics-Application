import { useQuery } from '@tanstack/react-query';
import { getScrollAnalytics } from '../api/scroll.api';
import { ScrollAnalyticsResponse } from '@causal-funnel/shared';

/**
 * React Query hook to fetch scroll analytics for a pageUrl.
 */
export function useScrollAnalytics(pageUrl: string) {
  return useQuery<ScrollAnalyticsResponse, Error>({
    queryKey: ['scrollAnalytics', pageUrl],
    queryFn: () => getScrollAnalytics(pageUrl),
    enabled: !!pageUrl,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5000, // Poll every 5 seconds for real-time scroll updates
  });
}
