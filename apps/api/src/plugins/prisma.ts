import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import pkg from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

const { PrismaClient: PrismaClientCtor } = pkg;

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClientCtor();
  await prisma.$connect();
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
});
