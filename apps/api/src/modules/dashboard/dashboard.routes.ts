import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { dashboardQuerySchema } from "@expense-tracker/shared";
import { getDashboardSummary } from "./dashboard.service.js";

export default async function dashboardRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook("preHandler", fastify.authenticate);

  app.get("/dashboard/summary", { schema: { querystring: dashboardQuerySchema } }, async (request) => {
    return getDashboardSummary(fastify.prisma, request.userId, request.query);
  });
}
