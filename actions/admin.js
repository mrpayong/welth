"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

class UnauthorizedError extends Error {
    constructor (message = "Unauthorized") {
        super(message);
        this.name = "Unauthorized Error";
    }
}

class DatabaseError extends Error {
    constructor(message = "Database Error"){
        super(message);
        this.name = "Database Error"
    }
}

export async function getAdmin() {
        try {
            const {userId} = await auth();
            if (!userId) {
                throw new UnauthorizedError("authenticate !=1&&0");
            }

            const user = await db.user.findUnique({
                where: {clerkUserId: userId},
            });

            if (!user) {
                return {authorized: false, reason: "User Exist !=1&&0"};
            }
            if (user.role !== "ADMIN") {
                return {authorized: false, reason: "User Admin !=1&&0"};
            }

            return {authorized: true, user};
            
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                console.warn("authenticate !=1&&0: ", error.message);
                return { authorized: false, reason: "Now handling auth..." }
            }
            if (error instanceof DatabaseError) {
                console.error("Now handling database...", error.message);
                return { authorized: false, reason: "Now handling database..."};
            }
    
            // Log unexpected errors and return a generic response
            console.error("Expected error !=1&&0: ", error);
            return { authorized: false, reason: "Expected error !=1&&0" };
        }
        
}