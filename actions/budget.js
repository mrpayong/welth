"use server"

import {db} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId){ //for fetching current budget
    console.log(" getCurrentBudget: identifying user...")
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not found");
        }

        console.log("getCurrentBudget: user identified, calculating budget...")
        // finding the budget
        const budget = await db.budget.findFirst({
            //finding the budget by userId, to find budget of a user
            where: {
                userId: user.id,
            },
        });

     
        // getting current month's expense
        const currentDate = new Date();
        const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() +1,
            0
        );
   
     

       
        // calculate all expenses
        const expenses = await db.transaction.aggregate({
            where: {
                userId: user.id,
                type: "EXPENSE",
                date:{
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                accountId,
            },
            _sum: {
                amount: true,
            },
            
        });

        
        console.log("getCurrentBudget: remaining budget calculated.")
        // calculating with respect to budget
        return {
            budget: budget
                ? {...budget, amount: budget.amount.toNumber()}
                : null,

            currentExpenses: expenses._sum.amount
                ? expenses._sum.amount.toNumber()
                : 0,
        };
    } catch (error) {
        cosnole.error("Error fetching budget:", error);
        throw error;
    }
}


export async function updateBudget(amount){ //for updating the budget
    try {
        console.log("updateBudget: identifying user...");
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not found.");
        }

        // updating the budget. 
        // 'upsert()' if there is no budget then will create.
        // if there is then will update
        const budget = await db.budget.upsert({
            where: {
                userId: user.id,
            },
            
            update: {
                amount,
            },
            create: {
                userId: user.id,
                amount,
            },
        });
        
        revalidatePath("/dashboard");
        return {
            success: true,
            date: {...budget, amount: budget.amount.toNumber()}, 
            
        };
    } catch (error) {
        console.error("Error updating budget:", error);
        return {success: false, error: error.message};
    }
}




