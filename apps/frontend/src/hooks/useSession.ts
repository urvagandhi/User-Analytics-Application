import { useQuery } from '@tanstack/react-query';
import { getSessionJourney, SessionJourneyResponse } from '../api/session.api';

/**
 * React Query hook to retrieve session metadata and timeline events.
 */
export function useSession(sessionId: string) {
  return useQuery<SessionJourneyResponse, Error>({
    queryKey: ['session', sessionId],
    queryFn: () => getSessionJourney(sessionId),
    enabled: !!sessionId, // Prevent fetch if no sessionId is selected
    staleTime: 10 * 1000, // 10 seconds stale time for active sessions
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
  });
}
