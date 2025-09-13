import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { createUser, createSchool, createNGO, joinNGO, joinSchool, createNGOEvent, createSchoolEvent, applyForNGOEvent, applyForSchoolEvent, getNGOEvents, getSchoolEvents } from "../service/user.service.js";

export const createUserController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const result = await createUser(data);
  return successHandle(result, reply, 201);
});

export const createOrgController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const params = request.params as { orgType: string };
  const userId = request.user.id;
  const orgType = params.orgType;
  console.log("Org Type:", orgType, "User ID:", userId, "Data:", data);
  let result;
  if (orgType === "School") {
    result = await createSchool(data, userId);
  } else if (orgType === "NGO") {
    result = await createNGO(data, userId);
  }

  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 201);
});

export const joinOrgController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const params = request.params as { orgType: string };
  const userId = request.user.id;
  const orgType = params.orgType;
  let result;
  if (orgType === "School") {
    result = await joinSchool(data.organization_code, userId);
  } else if (orgType === "NGO") {
    result = await joinNGO(data.organization_code, userId);
  }
 
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const createNGOEventController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const userId = request.user.id;
  const result = await createNGOEvent(data);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 201);
});

export const createSchoolEventController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const userId = request.user.id;
  const result = await createSchoolEvent(data);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 201);
});

export const applyForNGOEventController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const userId = request.user.id;
  const result = await applyForNGOEvent(data.eventId);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const applyForSchoolEventController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const userId = request.user.id;
  const result = await applyForSchoolEvent(data.eventId, userId);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const getNGOEventsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getNGOEvents(page);
  return successHandle(result, reply, 200);
});

export const getSchoolEventsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const { SchoolId } = request.params as { SchoolId: string };
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getSchoolEvents(page, SchoolId);
  return successHandle(result, reply, 200);
});
