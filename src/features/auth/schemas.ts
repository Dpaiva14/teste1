import { z } from "@/lib/zod";

// Client-safe (no server-only imports): shared by the forms and the API routes.

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "1234567890", "12345678910", "qwertyuiop", "1q2w3e4r5t",
  "iloveyou123", "letmein1234", "admin12345", "welcome1234", "trading123", "tradingacademy",
  "abc1234567", "0123456789", "passw0rd123", "football123", "monkey12345", "dragon12345", "master12345",
]);

/** NIST-style policy: length over composition rules, plus a small deny-list of obvious choices. */
export const passwordSchema = z
  .string()
  .min(10, "A password deve ter pelo menos 10 caracteres.")
  .max(128, "A password deve ter no máximo 128 caracteres.")
  .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), "Esta password é demasiado comum. Escolhe outra.")
  .refine((p) => new Set(p).size >= 5, "A password é demasiado repetitiva.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Indica um e-mail válido."));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome.").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Indica a password.").max(128),
  next: z.string().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(128).optional(),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
