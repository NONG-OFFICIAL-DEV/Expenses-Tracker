import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerSchema, loginSchema } from "@expense-tracker/shared";
import { registerUser, verifyCredentials, toPublicUser, AuthError } from "./auth.service.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_COOKIE_MAX_AGE_SECONDS } from "../../lib/jwt.js";
import { env } from "../../config/env.js";

const REFRESH_COOKIE_NAME = "refresh_token";

export default async function authRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  function setRefreshCookie(reply: import("fastify").FastifyReply, token: string) {
    reply.setCookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      path: "/",
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
  }

  app.post("/auth/register", { schema: { body: registerSchema } }, async (request, reply) => {
    try {
      const user = await registerUser(fastify.prisma, request.body);
      const accessToken = signAccessToken({ userId: user.id });
      setRefreshCookie(reply, signRefreshToken({ userId: user.id }));
      return reply.code(201).send({ accessToken, user: toPublicUser(user) });
    } catch (err) {
      if (err instanceof AuthError) return reply.code(409).send({ message: err.message });
      throw err;
    }
  });

  app.post("/auth/login", { schema: { body: loginSchema } }, async (request, reply) => {
    try {
      const user = await verifyCredentials(fastify.prisma, request.body);
      const accessToken = signAccessToken({ userId: user.id });
      setRefreshCookie(reply, signRefreshToken({ userId: user.id }));
      return reply.send({ accessToken, user: toPublicUser(user) });
    } catch (err) {
      if (err instanceof AuthError) return reply.code(401).send({ message: err.message });
      throw err;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (!token) return reply.code(401).send({ message: "Missing refresh token" });
    try {
      const payload = verifyRefreshToken(token);
      const user = await fastify.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return reply.code(401).send({ message: "User not found" });
      const accessToken = signAccessToken({ userId: user.id });
      setRefreshCookie(reply, signRefreshToken({ userId: user.id }));
      return reply.send({ accessToken, user: toPublicUser(user) });
    } catch {
      return reply.code(401).send({ message: "Invalid or expired refresh token" });
    }
  });

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    return reply.send({ ok: true });
  });

  app.get("/auth/me", { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({ where: { id: request.userId } });
    if (!user) return reply.code(404).send({ message: "User not found" });
    return reply.send(toPublicUser(user));
  });
}
