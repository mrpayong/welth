"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = {...obj};

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }

    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
};


//action for creating account
export async function createAccount(data) {
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
         

        // Convert balance to float before save
        const balanceFloat = parseFloat(data.balance)
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance amount");
        }

        // check if this is the user's 1st account
        const existingAccounts = await db.account.findMany({
            where: {userId: user.id},
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        // if this account should be default, unset other def accounts
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: {userId: user.id, isDefault: true},
                data: {isDefault: false},
            });
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return {success: true, data: serializedAccount};
    } catch (error) {
        throw new Error(error.message);
    }
}


//get user account server action
export async function getUserAccounts() {
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if (!user) {
        throw new Error("User not Found");
    }


    //to find acc
    const accounts = await db.account.findMany({                                            
        where: {userId: user.id }, //find acc that belongs to a user
        orderBy: { createdAt: "desc" }, //order by descending to when the acc is created
        include: { //include the count of all transacs
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });

    const serializedAccount = accounts.map(serializeTransaction); //for every transac, serializeTransaction function will run

    return serializedAccount; 
}

export async function getDashboardData() {
    const {userId} = await auth();
    if (!userId) throw new Error ("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if (!user) {
        throw new Error ("User not found.");
    }

    // Get all user transactions
    const transactions = await db.transaction.findMany({
        where: {userId: user.id},
        orderBy: {date: "desc"},
    });

    return transactions.map(serializeTransaction);
}