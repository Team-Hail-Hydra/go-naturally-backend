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

export const createOrg = async (data: Org, orgType: string, userId: string) => {
    try {
        const result = await prisma.$transaction(async (tx: any) => {
            const org = await tx[orgType].create({
                data: {
                    name: data.name,
                    phoneNo: data.phoneNo,
                    email: data.email,
                },
            });
            const profile = await tx.profile.update({
                where: { userId: userId },
                data: { [orgType + "Id"]: org.id },
            });
            return { org, profile };
        });
        return result;

    } catch (error: unknown) {
        return "Error creating school: " + (error instanceof Error ? error.message : String(error));
    }
}