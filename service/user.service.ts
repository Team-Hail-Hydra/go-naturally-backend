import { PrismaClient } from "../generated/prisma/index.js";
import { User } from "../types/user";
import { Org } from "../types/org.type.js";

const prisma = new PrismaClient();

const join = async () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createUser = async (data: User) => {
  try {
    const check = await getUserByUserId(data.userId);
    if (typeof check !== "string" && check !== null) {
      const user = await prisma.profile.update({
        where: { userId: data.userId },
        data: {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          profilePic: data.profilePic,
        },
      });
      return user;
    }
    const user = await prisma.profile.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        profilePic: data.profilePic,
      },
    });
    return user;
  } catch (error: unknown) {
    return (
      "Error creating user: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getUserByUserId = async (userId: string) => {
  try {
    const user = await prisma.profile.findUnique({
      where: { userId: userId },
    });
    return user;
  } catch (error: unknown) {
    return (
      "Error getting user by userId: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
      include: {
        school: true,
        ngo: true,
      },
    });
    return user;
  } catch (error: unknown) {
    console.log(error);
    return (
      "Error getting user: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createSchool = async (data: Org, userId: string) => {
  const code = await join();
  console.log("Generated join code for school:", code);
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const org = await tx.school.create({
        data: {
          name: data.name,
          phoneNo: data.phoneNo,
          email: data.email,
          joinCode: code, // Changed from joinNGO to joinCode
        },
      });
      const profile = await tx.profile.update({
        where: { userId: userId },
        data: { schoolId: org.id },
      });
      return { org, profile };
    });
    return result;
  } catch (error: unknown) {
    return (
      "Error creating school: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createNGO = async (data: Org, userId: string) => {
  const code = await join();
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const org = await tx.NGO.create({
        data: {
          name: data.name,
          phoneNo: data.phoneNo,
          email: data.email,
          joinNGO: code,
        },
      });
      const profile = await tx.profile.update({
        where: { userId: userId },
        data: { ngoId: org.id },
      });
      return { org, profile };
    });
    return result;
  } catch (error: unknown) {
    return (
      "Error creating school: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const joinSchool = async (orgId: string, userId: string) => {
  try {
    console.log("Joining school with join code:", orgId);
    const org = await prisma.school.findUnique({
      where: { joinCode: orgId },
    });
    if (!org) {
      console.log("School not found");
      return "School not found";
    }
    const organization_id = await prisma.school.findUnique({
      where: { joinCode: orgId },
    });
    console.log(organization_id);
    const profile = await prisma.profile.update({
      where: { userId: userId },
      data: { schoolId: organization_id?.id },
    });
    return profile;
  } catch (error: unknown) {
    return (
      "Error joining org: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const joinNGO = async (orgId: string, userId: string) => {
  try {
    const org = await prisma.nGO.findUnique({
      where: { joinCode: orgId },
    });
    if (!org) {
      return "NGO not found";
    }
    const organization_id = await prisma.nGO.findUnique({
      where: { joinCode: orgId },
      select: { id: true },
    });
    const profile = await prisma.profile.update({
      where: { userId: userId },
      data: { ngoId: organization_id?.id },
    });
    return profile;
  } catch (error: unknown) {
    return (
      "Error joining org: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createNGOEvent = async (data: any) => {
  try {
    const Event = await prisma.nGO_Events.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        latitude: data.latitude,
        longitude: data.longitude,
        ngoId: data.ngoId,
      },
    });
    return Event;
  } catch (error: unknown) {
    console.log(error);
    return (
      "Error creating NGO event: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createSchoolEvent = async (data: any) => {
  try {
    const Event = await prisma.school_Events.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        latitude: data.latitude,
        longitude: data.longitude,
        schoolId: data.schoolId,
      },
    });
    return Event;
  } catch (error: unknown) {
    return (
      "Error creating school event: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const applyForNGOEvent = async (data: any) => {
  try {
    const application = await prisma.nGO_Events_Applications.create({
      data: {
        profileId: data.userId,
        ngoEventId: data.eventId,
        status: "PENDING",
      },
    });
    return application;
  } catch (error: unknown) {
    return (
      "Error applying for NGO event: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const applyForSchoolEvent = async (data: any, userId: string) => {
  try {
    const application = await prisma.school_Events_Applications.create({
      data: {
        profileId: userId,
        schoolEventId: data.eventId,
      },
    });
    return application;
  } catch (error: unknown) {
    return (
      "Error applying for school event: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getSchoolEventApplications = async (
  page: number,
  eventId: string
) => {
  try {
    const applicationCounts = await prisma.school_Events_Applications.count({
      where: { schoolEventId: eventId },
    });
    const applications = await prisma.school_Events_Applications.findMany({
      skip: (page - 1) * 10,
      take: 10,
      where: { schoolEventId: eventId },
      include: {
        profile: true,
      },
    });
    return {
      applications,
      totalPages: Math.ceil(applicationCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching school event applications: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getNGOEvents = async (page: number, NGOId: string) => {
  try {
    let eventCounts = 0;
    let events;
    if (!NGOId) {
      eventCounts = await prisma.nGO_Events.count();
      events = await prisma.nGO_Events.findMany({
        skip: (page - 1) * 10,
        take: 10,
        include: {
          ngo: true,
        },
      });
    } else {
      eventCounts = await prisma.nGO_Events.count({ where: { ngoId: NGOId } });
      events = await prisma.nGO_Events.findMany({
        skip: (page - 1) * 10,
        take: 10,
        where: { ngoId: NGOId },
        include: {
          ngo: true,
        },
      });
    }
    return {
      events,
      totalPages: Math.ceil(eventCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching NGO events: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getSchoolEvents = async (page: number, SchoolId: string) => {
  try {
    const eventCounts = await prisma.school_Events.count();
    const events = await prisma.school_Events.findMany({
      skip: (page - 1) * 10,
      take: 10,
      where: { schoolId: SchoolId },
    });
    return {
      events,
      totalPages: Math.ceil(eventCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching school events: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createPlant = async (data: any, ecopoints: number) => {
  try {
    const plant = await prisma.plant.create({
      data: {
        plantName: data.plantName,
        imageUrl: data.imageUrl,
        rarity: data.rarity,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        createdById: data.createdById,
      },
    });
    await prisma.profile.update({
      where: { userId: data.createdById },
      data: { ecoPoints: { increment: ecopoints } },
    });
    return {
      plant,
      ecopoints,
    };
  } catch (error: unknown) {
    return (
      "Error creating plant: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createLitter = async (data: any) => {
  try {
    const litter = await prisma.litter.create({
      data: {
        beforeImg: data.beforeImg,
        afterImg: data.afterImg,
        latitude: data.latitude,
        longitude: data.longitude,
        createdById: data.createdById,
      },
    });
    return litter;
  } catch (error: unknown) {
    return (
      "Error creating litter: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getLittersBySchoolId = async (schoolId: string, page: number) => {
  try {
    console.log("Searching for litters with schoolId:", schoolId);

    const litterCounts = await prisma.litter.count({
      where: {
        createdBy: {
          schoolId: schoolId,
        },
      },
    });

    console.log("Found litter count:", litterCounts);

    const litters = await prisma.litter.findMany({
      where: {
        createdBy: {
          schoolId: schoolId,
        },
      },
      include: {
        createdBy: true,
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    return {
      litters,
      totalPages: Math.ceil(litterCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    console.error("Error in getLittersBySchoolId:", error);
    return (
      "Error fetching litters: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getLitterById = async (litterId: string) => {
  try {
    const litter = await prisma.litter.findUnique({
      where: {
        id: litterId,
      },
      include: {
        createdBy: true,
      },
    });
    return litter;
  } catch (error: unknown) {
    return (
      "Error fetching litter: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const addEcoPoints = async (
  userId: string,
  points: number,
  litterId: string
) => {
  try {
    const user = await prisma.profile.update({
      where: { userId: userId },
      data: { ecoPoints: { increment: points } },
    });
    await prisma.litter.update({
      where: { id: litterId },
      data: { isAwarded: true },
    });
    return user;
  } catch (error: unknown) {
    return (
      "Error adding ecopoints: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getLeaderBoard = async () => {
  try {
    const users = await prisma.profile.findMany({
      orderBy: { ecoPoints: "desc" },
      where: {
        role: { equals: "STUDENT" },
        ecoPoints: { gt: 0 },
      },
      include: {
        school: true,
      },
      take: 10,
    });
    return users;
  } catch (error: unknown) {
    return (
      "Error fetching leaderboard: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getLeaderBoardBySchoolId = async (schoolId: string) => {
  try {
    const users = await prisma.profile.findMany({
      where: { schoolId: schoolId },
      orderBy: { ecoPoints: "desc" },
      include: {
        school: true,
      },
      take: 10,
    });
    return users;
  } catch (error: unknown) {
    return (
      "Error fetching leaderboard by school ID: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const createAnimal = async (
  data: any,
  userId: string,
  ecopoints: number
) => {
  console.log(
    "Creating animal with data:",
    data,
    "for userId:",
    userId,
    "ecopoints:",
    ecopoints
  );
  try {
    const animal = await prisma.animals.create({
      data: {
        name: data.name || data.animal, // Handle both 'name' and 'animal' fields from Gemini response
        description: data.description,
        imageUrl: data.imageUrl,
        average_life_span: data.average_life_span,
        latitude: data.latitude,
        longitude: data.longitude,
        rarity: data.rarity,
        createdById: userId,
      },
    });

    // Award ecopoints to the user
    await prisma.profile.update({
      where: { userId: userId },
      data: { ecoPoints: { increment: ecopoints } },
    });

    return {
      animal,
      ecopoints,
    };
  } catch (error: unknown) {
    return (
      "Error creating animal: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getLittersByStudentId = async (
  studentId: string,
  page: number
) => {
  try {
    const litterCounts = await prisma.litter.count({
      where: {
        createdById: studentId,
      },
    });
    const litters = await prisma.litter.findMany({
      where: {
        createdById: studentId,
      },
      skip: (page - 1) * 10,
      take: 10,
    });
    return {
      litters,
      totalPages: Math.ceil(litterCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching litters: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getPlantsByStudentId = async (studentId: string, page: number) => {
  try {
    const plantCounts = await prisma.plant.count({
      where: {
        createdById: studentId,
      },
    });
    const plants = await prisma.plant.findMany({
      where: {
        createdById: studentId,
      },
      skip: (page - 1) * 10,
      take: 10,
    });
    return {
      plants,
      totalPages: Math.ceil(plantCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching plants: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getAnimalsByStudentId = async (
  studentId: string,
  page: number
) => {
  try {
    const animalCounts = await prisma.animals.count({
      where: {
        createdById: studentId,
      },
    });
    const animals = await prisma.animals.findMany({
      where: {
        createdById: studentId,
      },
      skip: (page - 1) * 10,
      take: 10,
    });
    return {
      animals,
      totalPages: Math.ceil(animalCounts / 10),
      currentPage: page,
    };
  } catch (error: unknown) {
    return (
      "Error fetching animals: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};

export const getMarkers = async () => {
  try {
    const plants = await prisma.plant.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        plantName: true,
        createdById: true,
      },
    });
    const litters = await prisma.litter.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        beforeImg: true,
        afterImg: true,
        createdById: true,
      },
    });
    const animals = await prisma.animals.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        name: true,
        createdById: true,
      },
    });

    return {
      plants,
      litters,
      animals,
    };
  } catch (error: unknown) {
    return (
      "Error fetching markers: " +
      (error instanceof Error ? error.message : String(error))
    );
  }
};
