import { PrismaClient } from "../generated/prisma/index.js";
import { User } from "../types/user";
import { Org } from "../types/org.type.js";

const prisma = new PrismaClient();


export const createUser = async (data: User) => {
    try {
        const user =  await prisma.profile.create({
            data:{
                userId: data.userId,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                profilePic: data.profilePic,
            }
        });
        return user;
    } catch (error: unknown) {
        return "Error creating user: " + (error instanceof Error ? error.message : String(error));
    }
}

export const getUserById = async (userId: string) => {
    try {
        const user = await prisma.profile.findUnique({
            where: { userId: userId },
        });
        return user;
    } catch (error: unknown) {
        return "Error getting user: " + (error instanceof Error ? error.message : String(error));
    }
}

export const createSchool = async (data: Org, userId: string) => {
    try {
        const result = await prisma.$transaction(async (tx: any) => {
            const org = await tx.school.create({
                data: {
                    name: data.name,
                    phoneNo: data.phoneNo,
                    email: data.email,
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
        return "Error creating school: " + (error instanceof Error ? error.message : String(error));
    }
}

export const createNGO = async (data: Org, userId: string) => {
    try {
        const result = await prisma.$transaction(async (tx: any) => {
            const org = await tx.NGO.create({
                data: {
                    name: data.name,
                    phoneNo: data.phoneNo,
                    email: data.email,
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
        return "Error creating school: " + (error instanceof Error ? error.message : String(error));
    }
}

export const joinSchool = async (orgId: string, userId: string) => {
    try{
        const org = await prisma.school.findUnique({
            where: { id: orgId },
        });
        if(!org){
            return "School not found";
        }
        const profile = await prisma.profile.update({
            where: { userId: userId },
            data: { schoolId: orgId },
        });
        return profile;

    }catch(error: unknown){
        return "Error joining org: " + (error instanceof Error ? error.message : String(error));
    }
}

export const joinNGO = async (orgId: string, userId: string) => {
    try{
        const org = await prisma.nGO.findUnique({
            where: { id: orgId },
        });
        if(!org){
            return "NGO not found";
        }
        const profile = await prisma.profile.update({
            where: { userId: userId },
            data: { ngoId: orgId },
        });
        return profile;

    }catch(error: unknown){
        return "Error joining org: " + (error instanceof Error ? error.message : String(error));
    }
}

export const createNGOEvent = async (data: any) => {
    try {
        const Event = await prisma.nGO_Events.create({
            data:{
                title: data.title,
                description: data.description,
                date: data.date,
                latitude: data.latitude,
                longitude: data.longitude,
                ngoId: data.ngoId
            }
        });
        return Event;
    } catch (error: unknown) {
        return "Error creating NGO event: " + (error instanceof Error ? error.message : String(error));
    }
}

export const createSchoolEvent = async (data: any) => {
    try {
        const Event = await prisma.school_Events.create({
            data:{
                title: data.title,
                description: data.description,
                date: data.date,
                latitude: data.latitude,
                longitude: data.longitude,
                schoolId: data.schoolId
            }
        });
        return Event;
    } catch (error: unknown) {
        return "Error creating school event: " + (error instanceof Error ? error.message : String(error));
    }
}

export const applyForNGOEvent = async (data: any) => {
    try {
        const application = await prisma.nGO_Events_Applications.create({
            data: {
                profileId: data.userId,
                ngoEventId: data.eventId,
                status: "PENDING",
                
            }
        });
        return application;
    } catch (error: unknown) {
        return "Error applying for NGO event: " + (error instanceof Error ? error.message : String(error));
    }
}

export const applyForSchoolEvent = async (data: any, userId: string) => {
    try {
        const application = await prisma.school_Events_Applications.create({
            data: {
                profileId: data.userId,
                schoolEventId: data.eventId,
            }
        });
        return application;
    } catch (error: unknown) {
        return "Error applying for school event: " + (error instanceof Error ? error.message : String(error));
    }
}

export const getNGOEvents = async (page: number) => {
    try {
        const eventCounts = await prisma.nGO_Events.count();
        const events = await prisma.nGO_Events.findMany({
            skip: (page - 1) * 10,
            take: 10,
        });
        return {
            events,
            totalPages: Math.ceil(eventCounts / 10),
            currentPage: page,
        };
    } catch (error: unknown) {
        return "Error fetching NGO events: " + (error instanceof Error ? error.message : String(error));
    }
}

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
        return "Error fetching school events: " + (error instanceof Error ? error.message : String(error));
    }
}



