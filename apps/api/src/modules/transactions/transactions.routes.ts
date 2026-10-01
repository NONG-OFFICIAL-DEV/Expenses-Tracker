import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { createTransactionSchema, updateTransactionSchema, transactionFiltersSchema } from "../../shared/index.js";
import * as transactionsService from "./transactions.service.js";

const idParamSchema = z.object({ id: z.string().cuid() });
const backfillQuerySchema = z.object({ offsetHours: z.coerce.number().min(-14).max(14).default(7) });

export default async function transactionsRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook("preHandler", fastify.authenticate);

  app.get("/transactions", { schema: { querystring: transactionFiltersSchema } }, async (request) => {
    return transactionsService.listTransactions(fastify.prisma, request.userId, request.query);
  });

  app.get("/transactions/:id", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      return await transactionsService.getTransaction(fastify.prisma, request.userId, request.params.id);
    } catch (err) {
      if (err instanceof transactionsService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });

  app.post("/transactions", { schema: { body: createTransactionSchema } }, async (request, reply) => {
    try {
      const transaction = await transactionsService.createTransaction(fastify.prisma, request.userId, request.body);
      return reply.code(201).send(transaction);
    } catch (err) {
      if (err instanceof transactionsService.ValidationError) return reply.code(400).send({ message: err.message });
      throw err;
    }
  });

  app.patch(
    "/transactions/:id",
    { schema: { params: idParamSchema, body: updateTransactionSchema } },
    async (request, reply) => {
      try {
        return await transactionsService.updateTransaction(fastify.prisma, request.userId, request.params.id, request.body);
      } catch (err) {
        if (err instanceof transactionsService.NotFoundError) return reply.code(404).send({ message: err.message });
        if (err instanceof transactionsService.ValidationError) return reply.code(400).send({ message: err.message });
        throw err;
      }
    }
  );

  app.delete("/transactions/:id", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      await transactionsService.deleteTransaction(fastify.prisma, request.userId, request.params.id);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof transactionsService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });

  // TEMPORARY one-time data-fix routes - see previewDateBackfill/applyDateBackfill
  // in transactions.service.ts. Remove both once run.
  app.get(
    "/transactions/backfill-preview",
    { schema: { querystring: backfillQuerySchema } },
    async (request) => transactionsService.previewDateBackfill(fastify.prisma, request.userId, request.query.offsetHours)
  );

  app.post(
    "/transactions/backfill-apply",
    { schema: { querystring: backfillQuerySchema } },
    async (request) => transactionsService.applyDateBackfill(fastify.prisma, request.userId, request.query.offsetHours)
  );

  app.post("/transactions/:id/duplicate", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      const transaction = await transactionsService.duplicateTransaction(fastify.prisma, request.userId, request.params.id);
      return reply.code(201).send(transaction);
    } catch (err) {
      if (err instanceof transactionsService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });
}
