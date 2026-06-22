import { z } from 'zod';

/**
 * Validation schema for listing sessions with pagination.
 */
export const ListSessionsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive('Page must be a positive integer')
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .positive('Limit must be a positive integer')
      .max(100, 'Maximum limit is 100')
      .default(50),
  }),
});

/**
 * Validation schema for checking individual session paths.
 */
export const GetSessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID parameter is required'),
  }),
});

export type ListSessionsInput = z.infer<typeof ListSessionsSchema>;
export type GetSessionParamsInput = z.infer<typeof GetSessionParamsSchema>;
