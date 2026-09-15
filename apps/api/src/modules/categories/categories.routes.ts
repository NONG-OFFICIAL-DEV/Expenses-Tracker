import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "@expense-tracker/shared";
import * as categoriesService from "./categories.service.js";

const idParamSchema = z.object({ id: z.string().cuid() });

export default async function categoriesRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook("preHandler", fastify.authenticate);

  app.get("/categories", async (request) => {
    return categoriesService.listCategories(fastify.prisma, request.userId);
  });

  app.post("/categories", { schema: { body: createCategorySchema } }, async (request, reply) => {
    try {
      const category = await categoriesService.createCategory(fastify.prisma, request.userId, request.body);
      return reply.code(201).send(category);
    } catch (err) {
      if (err instanceof categoriesService.ValidationError) return reply.code(400).send({ message: err.message });
      throw err;
    }
  });

  app.patch(
    "/categories/:id",
    { schema: { params: idParamSchema, body: updateCategorySchema } },
    async (request, reply) => {
      try {
        return await categoriesService.updateCategory(fastify.prisma, request.userId, request.params.id, request.body);
      } catch (err) {
        if (err instanceof categoriesService.NotFoundError) return reply.code(404).send({ message: err.message });
        throw err;
      }
    }
  );

  app.delete("/categories/:id", { schema: { params: idParamSchema } }, async (request, reply) => {
    try {
      await categoriesService.deleteCategory(fastify.prisma, request.userId, request.params.id);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof categoriesService.NotFoundError) return reply.code(404).send({ message: err.message });
      throw err;
    }
  });
}
