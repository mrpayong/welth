"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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


// for updating which account is the default account
export async function updateDefaultAccount(accountId) {
    try {
        // for checking if the user exist or not
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }

        //unset the default status of all financial accs as false
        await db.account.updateMany({
            where: {userId: user.id, isDefault: true},
            data: {isDefault: false},
        });

        //update logic of account's default status
        const account = await db.account.update({
            where: { //through selected accountId, account is updated to default
                id: accountId,
                userId: user.id,
            },
            data: { isDefault: true },
        });

        revalidatePath("/dashboard");
        return {success: true, data: serializeTransaction(account)};
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAccountWithTransactions(accountId) {
    const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }

    const account = await db.account.findUnique({
        where: { id: accountId, userId: user.id },
        include: {
            transactions: {
                orderBy: {date: "desc" },
            },
            _count: {
                select: { transactions: true },
            },
        },
    });

    if (!account) return null;

    return {
        ...serializeTransaction(account), //to convert all decimals into number
        transactions: account.transactions.map(serializeTransaction), // when mapping through transaction obj.amnt will automatically be converted into number
    }
}

export async function bulkDeleteTransactions(transactionIds) {
    try {
            console.log("Starting bulk delete transactions");   
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
        console.log("User found:", user);

        // fetching all transactions
        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds},
                userId: user.id,
            },
        });
            console.log("Fetched transactions:", transactions);

        // calculate transactions
        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const change = transaction.type === "EXPENSE"
                ? transaction.amount
                : -transaction.amount;

            const amount = parseFloat(change);
            if (isNaN(amount)) {
                throw new Error(`Invalid amount value: ${change}`);
            }

            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + amount;
            return acc;
        }, {})

        console.log("Account balance changes:", accountBalanceChanges);

        // delete transaction and update account balance in a transac
        await db.$transaction(async (tx) => {
            // Delete transac
            await tx.transaction.deleteMany({
                where: {
                    id: {in: transactionIds},
                    userId: user.id,
                },
            });

            console.log("Transactions deleted");

            for (const [accountId, balanceChange] of Object.entries(
                accountBalanceChanges
            )) {
                await tx.account.update({
                    where: {id: accountId},
                    data: {
                        balance: {
                            increment: balanceChange
                        },
                    },
                });
            }
            
        });
        

        revalidatePath("/dashboard");
        revalidatePath("/account/[id]");

        console.log("Paths revalidated");

        return {success: true};
    } catch (error) {
     console.error("Error in bulkDeleteTransactions:", error);
        return {success: false, error: error.message};
    }
}
// export async function bulkDeleteTransactions(transactionIds) {
//     try {
//         console.log("Starting bulk delete transactions");
//       const { userId } = await auth();
//       if (!userId) throw new Error("Unauthorized");
  
//       const user = await db.user.findUnique({
//         where: { clerkUserId: userId },
//       });
  
//       if (!user) throw new Error("User not found");
//       console.log("User found:", user);
  
//       // Get transactions to calculate balance changes
//       const transactions = await db.transaction.findMany({
//         where: {
//           id: { in: transactionIds },
//           userId: user.id,
//         },
//       });

//       console.log("Fetched transactions:", transactions);
  
//       // Group transactions by account to update balances
//       const accountBalanceChanges = transactions.reduce((acc, transaction) => {
//         const change =
//           transaction.type === "EXPENSE"
//             ? transaction.amount
//             : -transaction.amount;

//             const amount = parseFloat(change);
//             if (isNaN(amount)) {
//                 throw new Error(`Invalid amount value: ${change}`);
//             }

//         acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
//         return acc;
//       }, {});

//       console.log("Account balance changes:", accountBalanceChanges);
  
//       // Delete transactions and update account balances in a transaction
//       await db.$transaction(async (tx) => {
//         // Delete transactions
//         await tx.transaction.deleteMany({
//           where: {
//             id: { in: transactionIds },
//             userId: user.id,
//           },
//         });

//         console.log("Transactions deleted");
  
//         // Update account balances
//         for (const [accountId, balanceChange] of Object.entries(
//           accountBalanceChanges
//         )) {
//           await tx.account.update({
//             where: { id: accountId },
//             data: {
//               balance: {
//                 increment: balanceChange,
//               },
//             },
//           });
//         }
        
//       });
  
//       revalidatePath("/dashboard");
//       revalidatePath("/account/[id]");
  
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

// export async function bulkDeleteTransactions(transactionIds) {
//     try {
//         console.log("Starting bulk delete transactions");

//         const { userId } = await auth();
//         if (!userId) throw new Error("Unauthorized");

//         const user = await db.user.findUnique({
//             where: { clerkUserId: userId },
//         });

//         if (!user) throw new Error("User not Found");
//         console.log("User found:", user);

//         const transactions = await db.transaction.findMany({
//             where: {
//                 id: { in: transactionIds },
//                 userId: user.id,
//             },
//         });

//         console.log("Fetched transactions:", transactions);

//         // Group transactions by account to update balances
//         const accountBalanceChanges = transactions.reduce((acc, transaction) => {
//             const change = transaction.type === "EXPENSE"
//                 ? transaction.amount
//                 : -transaction.amount;

//             // Ensure the amount is a number
//             const amount = parseFloat(change);
//             if (isNaN(amount)) {
//                 throw new Error(`Invalid amount value: ${change}`);
//             }

//             acc[transaction.accountId] = (acc[transaction.accountId] || 0) + amount;
//             return acc;
//         }, {});

//         console.log("Account balance changes:", accountBalanceChanges);

//         // Delete transactions and update account balances in a transaction
//         await db.$transaction(async (tx) => {
//             // Delete transactions
//             await tx.transaction.deleteMany({
//                 where: {
//                     id: { in: transactionIds },
//                     userId: user.id,
//                 },
//             });

//             console.log("Transactions deleted");

//             // Update account balances
//             for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
//                 await tx.account.update({
//                     where: { id: accountId },
//                     data: {
//                         balance: {
//                             increment: balanceChange,
//                         },
//                     },
//                 });
//             }
//             console.log("Account balances updated");
//         });

//         revalidatePath("/dashboard");
//         revalidatePath("/account/[id]");

//         console.log("Paths revalidated");

//         return { success: true };
//     } catch (error) {
//         console.error("Error in bulkDeleteTransactions:", error);
//         return { success: false, error: error.message };
//     }
// }
  
