import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
  currency: z.string().length(3).default("USD"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  currency: z.string(),
});
export type MeResponse = z.infer<typeof meResponseSchema>;
