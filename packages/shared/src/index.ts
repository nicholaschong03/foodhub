import { z } from 'zod';

// User authentication schema
export const UserAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type inference from schema
export type UserAuth = z.infer<typeof UserAuthSchema>;

// Example API response type
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;