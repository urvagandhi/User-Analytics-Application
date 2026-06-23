import { useQuery } from '@tanstack/react-query';
import {
  getFrustrationSummary,
  getFrustrationElements,
  getFrustrationPages,
  getFrustrationTimeline,
  getFrustrationHeatmap,
  FrustrationSummaryData,
  FrustratedElementData,
  FrustratedPageData,
  FrustrationTimelineData,
  FrustrationHeatmapPoint,
} from '../api/frustration.api';

export function useFrustrationSummary() {
  return useQuery<FrustrationSummaryData, Error>({
    queryKey: ['frustrationSummary'],
    queryFn: getFrustrationSummary,
    staleTime: 5000,
    refetchInterval: 5000, // Poll every 5s for real-time update
  });
}

export function useFrustrationElements() {
  return useQuery<FrustratedElementData[], Error>({
    queryKey: ['frustrationElements'],
    queryFn: getFrustrationElements,
    staleTime: 5000,
    refetchInterval: 5000,
  });
}

export function useFrustrationPages() {
  return useQuery<FrustratedPageData[], Error>({
    queryKey: ['frustrationPages'],
    queryFn: getFrustrationPages,
    staleTime: 5000,
    refetchInterval: 5000,
  });
}

export function useFrustrationTimeline() {
  return useQuery<FrustrationTimelineData[], Error>({
    queryKey: ['frustrationTimeline'],
    queryFn: getFrustrationTimeline,
    staleTime: 5000,
    refetchInterval: 5000,
  });
}

export function useFrustrationHeatmap(pageUrl: string) {
  return useQuery<FrustrationHeatmapPoint[], Error>({
    queryKey: ['frustrationHeatmap', pageUrl],
    queryFn: () => getFrustrationHeatmap(pageUrl),
    enabled: !!pageUrl,
    staleTime: 5000,
    refetchInterval: 5000,
  });
}
