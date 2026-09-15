import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { monthlyReportQuerySchema } from "@expense-tracker/shared";
import { getMonthlyReport } from "./reports.service.js";

export default async function reportsRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook("preHandler", fastify.authenticate);

  app.get("/reports/monthly", { schema: { querystring: monthlyReportQuerySchema } }, async (request) => {
    return getMonthlyReport(fastify.prisma, request.userId, request.query);
  });
}
