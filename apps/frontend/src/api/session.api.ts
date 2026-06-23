import { apiClient } from '../utils/api-client';

export interface SessionData {
  sessionId: string;
  userAgent: string;
  startedAt: string;
  lastSeen: string;
  totalEvents: number;
  pagesVisited: string[];
}

export interface SessionJourneyResponse {
  session: SessionData;
  events: any[]; // TrackingEvent from @causal-funnel/shared
}

/**
 * Fetches list of sessions with pagination.
 */
export async function getSessions(page = 1, limit = 50): Promise<SessionData[]> {
  return apiClient<SessionData[]>(`/sessions?page=${page}&limit=${limit}`);
}

/**
 * Fetches timeline events and session data for a session ID.
 */
export async function getSessionJourney(sessionId: string): Promise<SessionJourneyResponse> {
  return apiClient<SessionJourneyResponse>(`/sessions/${sessionId}/journey`);
}
