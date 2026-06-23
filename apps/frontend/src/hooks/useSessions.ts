import { useQuery } from '@tanstack/react-query';
import { getSessions, SessionData } from '../api/session.api';

/**
 * React Query hook to list paginated user sessions.
 */
export function useSessions(page = 1, limit = 50) {
  return useQuery<SessionData[], Error>({
    queryKey: ['sessions', page, limit],
    queryFn: () => getSessions(page, limit),
    staleTime: 15 * 1000, // 15 seconds stale time
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
}
