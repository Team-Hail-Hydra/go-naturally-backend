import type{ FastifyInstance } from "fastify";
import { createUserController,createOrgController, joinOrgController } from "../controllers/user.controller.js";
import  authHandler from "../utils/authChecker.js";

export const routes = async (fastify: FastifyInstance): Promise<void> => {
  // Declare a route for the root path
  fastify.post('/user', { preHandler: authHandler }, createUserController);
  fastify.post('/org/:orgType', { preHandler: authHandler }, createOrgController);
  fastify.post('/org/join/:orgType', { preHandler: authHandler }, joinOrgController);
};