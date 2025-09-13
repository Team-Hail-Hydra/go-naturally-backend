import type{ FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { createUser, createSchool, createNGO, joinOrg } from "../service/user.service.js";

export const createUserController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as any;
    const result = await createUser(data);
    return successHandle(result,reply, 201);
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
    return successHandle(result,reply, 201);
});

export const joinOrgController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as any;
    const params = request.params as { orgType: string };
    const userId = request.user.id;
    const orgType = params.orgType;
    const result = await joinOrg(data.orgId, orgType, userId);
    if (typeof result === "string") {
        return errorHandle(result, reply, 400);
    }
    return successHandle(result, reply, 200);
});
