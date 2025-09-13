import type{ FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { createUser, createOrg } from "../service/user.service.js";

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
    const result = await createOrg(data, orgType, userId);
    return successHandle(result,reply, 201);
});


