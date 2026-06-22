import { z } from 'zod';

export const GetScrollSchema = z.object({
  query: z.object({
    pageUrl: z.string().min(1, 'pageUrl query parameter is required'),
  }),
});

export type GetScrollInput = z.infer<typeof GetScrollSchema>;
