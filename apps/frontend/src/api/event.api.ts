import { apiClient } from '../utils/api-client';

/**
 * Submits a batch of events manually to the ingestion backend.
 */
export async function sendEventBatch(
  events: any[]
): Promise<{ processed: number; failed: number }> {
  return apiClient<{ processed: number; failed: number }>('/events/batch', {
    method: 'POST',
    body: JSON.stringify(events),
  });
}
