import { apiClient } from '../utils/api-client';

export interface FrustrationSummaryData {
  totalRageClicks: number;
  totalDeadClicks: number;
  affectedPages: number;
  score: number;
  severity: 'Low' | 'Medium' | 'High';
  topFrustratedElements: any[];
}

export interface FrustratedElementData {
  selector: string;
  text: string;
  pageUrl: string;
  rageCount: number;
  deadCount: number;
}

export interface FrustratedPageData {
  pageUrl: string;
  rageClicks: number;
  deadClicks: number;
}

export interface FrustrationTimelineData {
  date: string;
  type: 'rage_click' | 'dead_click';
  count: number;
}

export async function getFrustrationSummary(): Promise<FrustrationSummaryData> {
  return apiClient<FrustrationSummaryData>('/frustration/summary');
}

export async function getFrustrationElements(): Promise<FrustratedElementData[]> {
  return apiClient<FrustratedElementData[]>('/frustration/elements');
}

export async function getFrustrationPages(): Promise<FrustratedPageData[]> {
  return apiClient<FrustratedPageData[]>('/frustration/pages');
}

export async function getFrustrationTimeline(): Promise<FrustrationTimelineData[]> {
  return apiClient<FrustrationTimelineData[]>('/frustration/timeline');
}

export interface FrustrationHeatmapPoint {
  xPct: number;
  yPct: number;
  type: 'rage_click' | 'dead_click';
}

export async function getFrustrationHeatmap(pageUrl: string): Promise<FrustrationHeatmapPoint[]> {
  const encodedUrl = encodeURIComponent(pageUrl);
  return apiClient<FrustrationHeatmapPoint[]>(`/frustration/heatmap?pageUrl=${encodedUrl}`);
}
