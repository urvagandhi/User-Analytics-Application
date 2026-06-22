import { z } from 'zod';
import { TrackingEventSchema } from '@causal-funnel/shared';

/**
 * Validation schema for the event tracking endpoint.
 * Expects an array of page views or click events in the request body.
 */
export const TrackEventBatchSchema = z.object({
  body: z.array(TrackingEventSchema).min(1, 'Event batch cannot be empty'),
});

export type TrackEventBatchInput = z.infer<typeof TrackEventBatchSchema>;
