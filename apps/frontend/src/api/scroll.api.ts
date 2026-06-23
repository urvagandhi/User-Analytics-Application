import { apiClient } from '../utils/api-client';
import { ScrollAnalyticsResponse, ScrollDropoffResponse } from '@causal-funnel/shared';

/**
 * Fetches general scroll metrics for a pageUrl.
 */
export async function getScrollAnalytics(pageUrl: string): Promise<ScrollAnalyticsResponse> {
  const encodedUrl = encodeURIComponent(pageUrl);
  return apiClient<ScrollAnalyticsResponse>(`/scroll?pageUrl=${encodedUrl}`);
}

/**
 * Fetches scroll drop-off milestones for a pageUrl.
 */
export async function getScrollDropoff(pageUrl: string): Promise<ScrollDropoffResponse> {
  const encodedUrl = encodeURIComponent(pageUrl);
  return apiClient<ScrollDropoffResponse>(`/scroll/dropoff?pageUrl=${encodedUrl}`);
}
