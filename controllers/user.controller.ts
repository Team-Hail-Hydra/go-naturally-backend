import type { FastifyRequest, FastifyReply } from "fastify";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { uploadToS3 } from "../utils/s3.service.js";
import { createUser, getUserById, createSchool, createNGO, joinNGO, joinSchool, createNGOEvent, createSchoolEvent, applyForNGOEvent, applyForSchoolEvent, getNGOEvents, getSchoolEvents, createPlant, createLitter, getLittersBySchoolId, addEcoPoints, createAnimal, getLeaderBoard, getLittersByStudentId, getPlantsByStudentId, getAnimalsByStudentId, getMarkers, getSchoolEventApplications } from "../service/user.service.js";
import { GoogleGenAI } from '@google/genai';

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
  console.log("Creating NGO Event with data:", data, "by user:", userId);
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
  const result = await applyForNGOEvent(data);
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

export const getSchoolEventApplicationsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const eventId = (request.query as any).eventId as string;
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getSchoolEventApplications(page, eventId);
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

export const createPlantsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parts = request.parts();
    let metadata: { [key: string]: any } = {};
    let uploadedFiles: any[] = [];
    // const userId = request.user.id;

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

    // const plantData = {
    //   plantName: metadata.plantName,
    //   imageUrl: uploadedFiles[0].url,
    //   latitude: parseInt(metadata.latitude),
    //   longitude: parseInt(metadata.longitude),
    //   createdById: userId
    // }

    const plantData = {
      plantName: metadata.plantName,
      imageUrl: uploadedFiles[0]?.url || '',
      latitude: parseFloat(metadata.latitude),
      longitude: parseFloat(metadata.longitude),
      createdById: request.user.id

    }
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = "gemini-2.0-flash";

    console.log("Plant Data:", plantData);
    
    // Get plant information from Gemini AI
    const getPlantInfo = async (plantName: string): Promise<{ rarity: number; description: string }> => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`
      const prompt = `Analyze the plant named "${plantName}" and provide information in JSON format only. The JSON should contain exactly these fields:
      - "rarity": integer from 1 to 5 (1=Very Common, 2=Common, 3=Uncommon, 4=Rare, 5=Very Rare)
      - "description": string with detailed description of the plant including its characteristics, habitat, and uses
      
      Return only the JSON object, nothing else.`
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        })
        const data = await response.json() as {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                text?: string
              }>
            }
          }>
        };
        
        const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!geminiText) {
          throw new Error("No response from Gemini AI");
        }
        
        // Extract JSON from the response
        const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : geminiText;
        
        const plantInfo = JSON.parse(jsonString);
        
        // Validate and ensure proper data types
        return {
          rarity: parseInt(plantInfo.rarity) || 1,
          description: plantInfo.description || 'No description available'
        };
        
      } catch (err) {
        console.error("Error getting plant info from Gemini:", err);
        // Return default values if Gemini fails
        return {
          rarity: 1,
          description: `Information about ${plantName} plant.`
        };
      }
    }
    
    const plantInfo = await getPlantInfo(plantData.plantName);
    console.log("Plant Info from Gemini:", plantInfo);

    // Calculate ecopoints based on rarity (1-5 scale)
    const calculateEcoPoints = (rarity: number): number => {
      switch (rarity) {
        case 1: // Very Common
          return 10;
        case 2: // Common
          return 25;
        case 3: // Uncommon
          return 50;
        case 4: // Rare
          return 100;
        case 5: // Very Rare
          return 200;
        default:
          console.warn(`Invalid rarity: ${rarity}, defaulting to 1`);
          return 10;
      }
    };

    const ecoPoints = calculateEcoPoints(plantInfo.rarity);
    console.log(`Plant: ${plantData.plantName}`);
    console.log(`Rarity: ${plantInfo.rarity}`);
    console.log(`Description: ${plantInfo.description}`);
    console.log(`Calculated Ecopoints: ${ecoPoints}`);

    // Structure the complete plant data object
    const completeePlantData = {
      plantName: plantData.plantName,
      imageUrl: plantData.imageUrl,
      latitude: plantData.latitude,
      longitude: plantData.longitude,
      createdById: plantData.createdById,
      rarity: plantInfo.rarity,
      description: plantInfo.description
    };

    // Save plant record to database
    const result = await createPlant(completeePlantData, ecoPoints);

    if (typeof result === "string") {
      return errorHandle(result, reply, 400);
    }
    return successHandle({
      plant: result,
    }, reply, 200);
  } catch (error) {
    console.error('Error processing plant upload:', error);
    return errorHandle('Failed to process plant upload', reply, 500);
  }
});

export const createLitterController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parts = request.parts();
    let UploadedFiles: any[] = [];
    const metadata: { [key: string]: any } = {};

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
        const uploadResult = await uploadToS3(fileBuffer, fileName, contentType, 'litter-images');
        UploadedFiles.push({
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
    const data = {
      beforeImg: UploadedFiles.find(file => file.fieldname === 'beforeImg')?.url || '',
      afterImg: UploadedFiles.find(file => file.fieldname === 'afterImg')?.url || '',
      latitude: parseFloat(metadata.latitude),
      longitude: parseFloat(metadata.longitude),
      createdById: request.user.id,
    }
    console.log("Litter Data:", data);
    const result = await createLitter(data);
    if (typeof result === "string") {
      return errorHandle(result, reply, 400);
    }
    return successHandle(result, reply, 201);
  } catch (error) {
    console.error('Error creating litter:', error);
    return errorHandle('Failed to create litter', reply, 500);
  }
});

export const getLittersBySchoolIdController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const page = parseInt((request.query as any).page as string || "1");
  const { schoolId } = request.params as { schoolId: string };
  const result = await getLittersBySchoolId(schoolId, page);
  return successHandle(result, reply, 200);
});

export const addEcoPointsController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  console.log("Adding Eco Points:", data);
  const result = await addEcoPoints(data.userId, data.points, data.litterId);
  return successHandle(result, reply, 200);
});

export const createAnimalController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const parts = request.parts();
  let uploadedFiles: any[] = [];
  let metadata: { [key: string]: any } = {};
  let animalData;

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

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const blob = new Blob([fileBuffer], { type: contentType });
      const myfile = await ai.files.upload({
        file: blob,
        config: { mimeType: contentType },
      });
      console.log("Uploaded file:", myfile);

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{
          role: "user",
          parts: [
            { fileData: { fileUri: myfile.uri, mimeType: myfile.mimeType } },
            { text: "Analyze this animal image and provide information in JSON format with exactly these fields:\n1. 'name': The common name of the animal (string)\n2. 'description': A detailed description including habitat, behavior, and characteristics (string, minimum 50 words)\n3. 'average_life_span': The typical lifespan in the wild or captivity (string)\n4. 'rarity': How rare this animal is on a scale of 1-5 where 1=very common, 2=common, 3=uncommon, 4=rare, 5=very rare/endangered (integer)\n\nReturn ONLY the JSON object with these exact field names, no additional text." }
          ]
        }],
      });
  
      
      // Parse the Gemini AI response as JSON
      
      try {
        const geminiText = result.text;
        if (!geminiText) {
          throw new Error("No text response from Gemini AI");
        }
        
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : geminiText;
        
        if (!jsonString) {
          throw new Error("No JSON found in Gemini response");
        }
        
        animalData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        return errorHandle("Failed to parse animal data from AI response", reply, 500);
      }
      
      // Upload to S3
      const uploadResult = await uploadToS3(fileBuffer, fileName, contentType, 'animal-images');

      uploadedFiles.push({
        fieldname: part.fieldname,
        originalName: fileName,
        contentType: contentType,
        size: fileBuffer.length,
        s3Key: uploadResult.key,
        url: uploadResult.url,
        location: uploadResult.location,
      });

    } else if ('value' in part) {
      // This is a regular form field
      metadata[part.fieldname] = part.value;
    }
  }
  animalData.imageUrl = uploadedFiles[0].url;
  animalData.latitude = parseFloat(metadata.latitude);
  animalData.longitude = parseFloat(metadata.longitude);
  console.log("Animal Data:", animalData);

  const result = await createAnimal(animalData, request.user.id);

  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 201);

});

export const getLeaderBoardController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const result = await getLeaderBoard();
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const getLitterByStudentId = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
 const studentId = request.user.id;
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getLittersByStudentId(studentId, page);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const getPlantsByStudentIdController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const studentId = request.user.id;
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getPlantsByStudentId(studentId, page);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result , reply, 200);
});

export const getAnimalsByStudentIdController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const studentId = request.user.id;
  const page = parseInt((request.query as any).page as string || "1");
  const result = await getAnimalsByStudentId(studentId, page);
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});

export const getMarkersController = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const result = await getMarkers();
  if (typeof result === "string") {
    return errorHandle(result, reply, 400);
  }
  return successHandle(result, reply, 200);
});
