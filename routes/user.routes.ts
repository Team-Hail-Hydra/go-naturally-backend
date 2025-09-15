import type{ FastifyInstance } from "fastify";
import { createUserController, getUserController,createOrgController, joinOrgController, createNGOEventController, createSchoolEventController, applyForNGOEventController, applyForSchoolEventController, getNGOEventsController, getSchoolEventsController, createPlantsController, createLitterController, getLittersBySchoolIdController, addEcoPointsController, createAnimalController, getLeaderBoardController, getMarkersController, getAnimalsByStudentIdController, getLitterByStudentId, getPlantsByStudentIdController, getSchoolEventApplicationsController } from "../controllers/user.controller.js";
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
  fastify.get('/school/event/applications/:eventId', { preHandler: authHandler }, getSchoolEventApplicationsController);
  fastify.get('/ngo/events', { preHandler: authHandler }, getNGOEventsController);
  fastify.get('/school/events', { preHandler: authHandler }, getSchoolEventsController);
  
  // Plant image upload endpoint
  fastify.post('/plants/upload', { preHandler: authHandler }, createPlantsController);
  fastify.post('/litter/upload', { preHandler: authHandler } , createLitterController);
  fastify.get('/litters/school/:schoolId', { preHandler: authHandler }, getLittersBySchoolIdController);
  fastify.post('/eco-points/add', { preHandler: authHandler }, addEcoPointsController);
  fastify.post('/animal/upload', { preHandler: authHandler } ,createAnimalController)

  fastify.get('/animals/student', { preHandler: authHandler }, getAnimalsByStudentIdController);
  fastify.get('/plants/student', { preHandler: authHandler }, getPlantsByStudentIdController);
  fastify.get('/litters/student', { preHandler: authHandler }, getLitterByStudentId);

  fastify.get('/leaderboard', getLeaderBoardController);
  fastify.get('/markers', getMarkersController);

};