import { z } from 'zod';

/**
 * Schema and Type for user session logs.
 */
export const SessionSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
  userAgent: z.string().min(1, 'User Agent is required'),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  pageViewsCount: z.number().int().nonnegative(),
  clicksCount: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
});

export type Session = z.infer<typeof SessionSchema>;
