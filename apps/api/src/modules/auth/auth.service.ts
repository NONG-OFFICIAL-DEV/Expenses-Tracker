import argon2 from "argon2";
import type { PrismaClient } from "@prisma/client";
import type { RegisterInput, LoginInput } from "@expense-tracker/shared";

export class AuthError extends Error {}

export async function registerUser(prisma: PrismaClient, input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AuthError("An account with this email already exists");

  const passwordHash = await argon2.hash(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      currency: input.currency,
    },
  });
  return user;
}

export async function verifyCredentials(prisma: PrismaClient, input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthError("Invalid email or password");
  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) throw new AuthError("Invalid email or password");
  return user;
}

export function toPublicUser(user: { id: string; email: string; name: string; currency: string }) {
  return { id: user.id, email: user.email, name: user.name, currency: user.currency };
}
