import { Role } from "../generated/prisma/index.js";

export interface User {
    userId: string;
    fullName: string;
    email: string;
    role: Role;
    profilePic?: string;
}