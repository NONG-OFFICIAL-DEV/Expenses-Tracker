import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { createAccountSchema, updateAccountSchema, reconcileAccountSchema } from "../../shared/index.js";
import * as accountsService from "./accounts.service.js";

const idParamSchema = z.object({ id: z.string().cuid() });

export default async function accountsRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook("preHandler", fastify.authenticate);

  app.get("/accounts", async (request) => {
    return accountsService.listAccounts(fastify.prisma, request.userId);
  });

  app.get("/accounts/:id", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      return await accountsService.getAccount(fastify.prisma, request.userId, request.params.id);
    } catch (err) {
      if (err instanceof accountsService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });

  app.post("/accounts", { schema: { body: createAccountSchema } }, async (request, reply) => {
    const account = await accountsService.createAccount(fastify.prisma, request.userId, request.body);
    return reply.code(201).send(account);
  });

  app.patch(
    "/accounts/:id",
    { schema: { params: idParamSchema, body: updateAccountSchema } },
    async (request, reply) => {
      try {
        return await accountsService.updateAccount(fastify.prisma, request.userId, request.params.id, request.body);
      } catch (err) {
        if (err instanceof accountsService.NotFoundError) return reply.code(404).send({ message: err.message });
        throw err;
      }
    }
  );

  app.delete("/accounts/:id", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      await accountsService.deleteAccount(fastify.prisma, request.userId, request.params.id);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof accountsService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });

  app.post(
    "/accounts/:id/reconcile",
    { schema: { params: idParamSchema, body: reconcileAccountSchema } },
    async (request, reply) => {
      try {
        const adjustment = await accountsService.reconcileAccount(
          fastify.prisma,
          request.userId,
          request.params.id,
          request.body
        );
        return reply.code(201).send(adjustment);
      } catch (err) {
        if (err instanceof accountsService.NotFoundError) return reply.code(404).send({ message: err.message });
        throw err;
      }
    }
  );

  app.get("/accounts/:id/adjustments", { schema: { params: idParamSchema } }, async (request) => {
    return accountsService.listBalanceAdjustments(fastify.prisma, request.params.id);
  });
}
