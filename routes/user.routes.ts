import type{ FastifyInstance } from "fastify";
import { createUserController, getUserController,createOrgController, joinOrgController, createNGOEventController, createSchoolEventController, applyForNGOEventController, applyForSchoolEventController, getNGOEventsController, getSchoolEventsController, getPlants  } from "../controllers/user.controller.js";
import  authHandler from "../utils/authChecker.js";

export const routes = async (fastify: FastifyInstance): Promise<void> => {
  // Declare a route for the root path
  fastify.post('/user', { preHandler: authHandler }, createUserController);
  fastify.get('/user/:userId', { preHandler: authHandler }, getUserController);
  fastify.post('/org/:orgType', { preHandler: authHandler }, createOrgController);
  fastify.post('/org/join/:orgType', { preHandler: authHandler }, joinOrgController);
  fastify.post('/ngo/event', { preHandler: authHandler }, createNGOEventController);
  fastify.post('/school/event', { preHandler: authHandler }, createSchoolEventController);
  fastify.post('/ngo/event/apply', { preHandler: authHandler }, applyForNGOEventController);
  fastify.post('/school/event/apply', { preHandler: authHandler }, applyForSchoolEventController);
  fastify.get('/ngo/events', { preHandler: authHandler }, getNGOEventsController);
  fastify.get('/school/events', { preHandler: authHandler }, getSchoolEventsController);
  
  // Plant image upload endpoint
  fastify.post('/plants/upload', { preHandler: authHandler }, getPlants);
};