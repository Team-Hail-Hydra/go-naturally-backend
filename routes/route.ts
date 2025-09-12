import type{ FastifyInstance } from "fastify";
import { controller } from "../controllers/controller.js";

export const routes = async (fastify: FastifyInstance): Promise<void> => {
  // Declare a route for the root path
  fastify.get('/', controller);

};