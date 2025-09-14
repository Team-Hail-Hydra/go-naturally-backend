import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { uploadToS3 } from "../utils/s3.service.js";
import { createUser, getUserById, createSchool, createNGO, joinNGO, joinSchool, createNGOEvent, createSchoolEvent, applyForNGOEvent, applyForSchoolEvent, getNGOEvents, getSchoolEvents, createPlant } from "../service/user.service.js";

export const createUserController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const result = await createUser(data);
  return successHandle(result, reply, 201);
});

export const getUserController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as { userId: string };
  const result = await getUserById(userId);
  return successHandle(result, reply, 200);
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
  const NGOId = (request.query as any).ngoId as string;
  const result = await getNGOEvents(page, NGOId);
  return successHandle(result, reply, 200);
});

export const getSchoolEventsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {

  const page = parseInt((request.query as any).page as string || "1");
  const SchoolId = (request.query as any).schoolId as string;
  const result = await getSchoolEvents(page, SchoolId);
  return successHandle(result, reply, 200);
});

export const getPlants = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parts = request.parts();
    let metadata: { [key: string]: any } = {};
    let uploadedFiles: any[] = [];
    const userId = request.user.id;
    
    for await (const part of parts) {
      if ('filename' in part && part.filename) {
        // This is a file part
        const fileBuffer = await part.toBuffer();
        const fileName = part.filename;
        const contentType = part.mimetype;
        
        // Validate file type (optional - add your own validation logic)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(contentType)) {
          return errorHandle(`File type ${contentType} is not allowed. Only images are permitted.`, reply, 400);
        }
        
        // Upload to S3
        const uploadResult = await uploadToS3(fileBuffer, fileName, contentType, 'plant-images');
        
        uploadedFiles.push({
          fieldname: part.fieldname,
          originalName: fileName,
          contentType: contentType,
          size: fileBuffer.length,
          s3Key: uploadResult.key,
          url: uploadResult.url,
          location: uploadResult.location
        });
        
      } else if ('value' in part) {
        // This is a regular form field
        metadata[part.fieldname] = part.value;
      }
    }
    
    const plantData = {
      plantName: metadata.plantName,
      imageUrl: uploadedFiles[0].url,
      latitude: parseInt(metadata.latitude),
      longitude: parseInt(metadata.longitude),
      createdById: userId
    }

    console.log("Plant Data:", plantData);

    const result = await createPlant(plantData);
    if (typeof result === "string") {
      return errorHandle(result, reply, 400);
    }
    return successHandle(result, reply, 201);
  } catch (error) {
    console.error('Error processing plant upload:', error);
    return errorHandle('Failed to process plant upload', reply, 500);
  }
});
