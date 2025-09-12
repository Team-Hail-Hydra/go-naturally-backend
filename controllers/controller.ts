import type{ FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";

export const controller = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Simulate some processing logic
    const data = { message: "Hello from the controller!" };
    
    // Send success response
    successHandle(data, reply, 200);
  } catch (error) {
    // Handle any errors that occur during processing
    errorHandle("An error occurred in the controller", reply, 500);
  }
});