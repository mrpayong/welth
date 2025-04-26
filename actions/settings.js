"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUser(){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId}
        });

        if (!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized")
        }

        //get all users
        const users = await db.user.findMany({
            orderBy: {createdAt: "desc"},
        })

        return {
            success: true,
            data: users.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString()
            })),
        };
    }catch (error) {
        throw new Error("Error fetching users:" + error.message);
    } 
}

export async function updateUserRole(userId, role){
    try {
        const {userId: adminId} = await auth();
        if(!adminId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: adminId}
        });

        if (!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized")
        }

        await db.user.update({
            where: {id: userId},
            data: {role},
        });

        revalidatePath("/admin/settings");

        return {success: true}
    }catch (error) {
        throw new Error("Error role udpate:" + error.message);
    } 
}