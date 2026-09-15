import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../lib/jwt.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return reply.code(401).send({ message: "Missing access token" });
    }
    const token = header.slice("Bearer ".length);
    try {
      const payload = verifyAccessToken(token);
      request.userId = payload.userId;
    } catch {
      return reply.code(401).send({ message: "Invalid or expired access token" });
    }
  });
});
