"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";


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
function validateTransactionTypes(transactions) {
  const transactionTypes = new Set(transactions.map((transaction) => transaction.type));
  if (transactionTypes.size > 1) {
    return { success: false, error: "Selected transactions must all have the same type (EXPENSE or INCOME)." };
  }
  return { success: true, type: [...transactionTypes][0] };
}

function validateActivityTypesConsistency(transactions) {
  const transactionActivityTypes = new Set(transactions.map((transaction) => transaction.Activity));
  if (transactionActivityTypes.size > 1) {
    return { success: false, error: "Selected transactions must all have the same Activity type" };
  }
  return { success: true, type: [...transactionActivityTypes][0] };
}

function calculateTotalAmount(transactions) {
  try {
    const total = transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount)) {
        throw new Error(`Invalid amount value: ${transaction.amount}`);
      }
      return total + amount;
    }, 0);
    return { success: true, total };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
async function validateTransactionActivity(parentSubAccountId, transactions, tx) {
  try {
    // Map through the parent sub-account's transactions to extract their Activity
    const parentTransactions = await tx.subAccountTransaction.findMany({
      where: { subAccountId: parentSubAccountId },
      include: {
        transaction: {
          select: { Activity: true },
        },
      },
    });

    // Check if the parent sub-account has no transactions
    if (parentTransactions.length === 0) {
      console.log("Parent sub-account has no transactions. Skipping Activity validation.");
      return { success: true }; // Skip validation and proceed
    }

    const parentActivity = parentTransactions[0]?.transaction.Activity;

    // Extract the Activity of the passed-in transactions (already fetched earlier)
    const transactionActivity = transactions[0]?.Activity;

    // Compare the Activity of the parent sub-account and the passed-in transactions
    if (parentActivity !== transactionActivity) {
      return {
        success: false,
        error: `The Activity type of the transactions (${transactionActivity}) does not match the parent sub-account's Activity type (${parentActivity}).`,
      };
    }

    // If the fields match, return success
    return { success: true };
  } catch (error) {
    console.error("Error validating transaction Activity:", error.message);
    return { success: false, error: error.message };
  }
}
























export async function createSubAccount(transactionIds, data) {
  try {
    // Authenticate the user (maintaining authorization)
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Validate the user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    console.log("PASSED DATA: ", data, transactionIds);

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
      select: {
        amount: true,
        type: true,
        Activity: true,
      },
    });

    // Maintaining validations
    const validationResult = validateTransactionTypes(transactions);
    if (!validationResult.success) {
      throw new Error("Select Transaction with same type (INCOME or EXPENSE).");
    }

    const validationActivity = validateActivityTypesConsistency(transactions);
    if (!validationActivity.success) {
      throw new Error("Inconsistent Activity type, must be same Activity types.");
    }

    const summationResult = calculateTotalAmount(transactions);
    if (!summationResult.success) {
      throw new Error("Detected possible invalid amount.");
    }

    const balanceFloat = summationResult.total;
    console.log("Validated transaction type:", validationResult.type);
    console.log("Calculated balanceFloat:", balanceFloat);

    // Use a transaction to ensure all operations succeed or fail together
    return await db.$transaction(async (tx) => {
      // Find the parent SubAccount if parentName is provided
      let parentSubAccount = null;
      if (data.parentName) {
        parentSubAccount = await tx.subAccount.findFirst({
          where: { name: data.parentName },
        });

        if (!parentSubAccount) {
          throw new Error(`Parent sub-account with name "${data.parentName}" not found`);
        }
      }

      
      //  console.log("this is parent data: ",parentSubAccount)
      //  try {
      //    if (parentSubAccount && transactionIds && transactionIds.length > 0) {
      //   const activityValidation = await validateTransactionActivity(
      //     parentSubAccount.id,
      //     transactions,
      //     tx
      //   );

      //   if (activityValidation.success == false) {
      //     throw new Error("Check the Activity Type.");
      //   }
      // }
      //  } catch (error) {
      //   console.error("Error validating transaction Activity:", error.message);
      //   throw new Error("MALING MALI: ",error.message);
      //   return { success: false, error: error.message };
      //  }
      if (parentSubAccount && transactionIds && transactionIds.length > 0) {
              const parentTransactions = await tx.subAccountTransaction.findMany({
        where: { subAccountId: parentSubAccount.id },
        include: {
          transaction: {
            select: { Activity: true },
          },
        },
      });
  
      // Check if the parent sub-account has no transactions
      if (parentTransactions.length === 0) {
        console.log("Parent sub-account has no transactions. Skipping Activity validation.");
        return { success: true }; // Skip validation and proceed
      }
  
      const parentActivity = parentTransactions[0]?.transaction.Activity;
  
      // Extract the Activity of the passed-in transactions (already fetched earlier)
      const transactionActivity = transactions[0]?.Activity;
  
      // Compare the Activity of the parent sub-account and the passed-in transactions
      if (parentActivity !== transactionActivity) {
        throw new Error(`The ${transactionActivity} activities does not match the ${parentActivity} activities.`);
      }
      }

     

      // Create the new SubAccount
      const subAccount = await tx.subAccount.create({
        data: {
          name: data.name,
          description: data.description,
          balance: balanceFloat,
          accountId: data.accountId,
        },
      });

      console.log("Sub-account created:", subAccount);

      // Link transactions to the sub-account
      if (transactionIds && transactionIds.length > 0) {
        await tx.subAccountTransaction.createMany({
          data: transactionIds.map((transactionId) => ({
            subAccountId: subAccount.id,
            transactionId,
          })),
        });
      }

      // Create parent-child relationship if a parent is specified
      if (parentSubAccount) {
        await tx.subAccountRelation.create({
          data: {
            parentId: parentSubAccount.id,
            childId: subAccount.id,
            relationName: `${parentSubAccount.name} -> ${subAccount.name}`
          }
        });

        console.log(`Relationship created between "${parentSubAccount.name}" and "${subAccount.name}"`);

        // Recursively update all parent balances up the hierarchy
        await updateParentBalancesInTransaction(tx, parentSubAccount.id, balanceFloat);
      }

      // Fetch the created sub-account with its transactions (maintaining serialization)
      const subAccountWithTransactions = await tx.subAccount.findUnique({
        where: { id: subAccount.id },
        include: {
          transactions: {
            include: {
              transaction: true,
            },
          },
        },
      });

      const serializedSubAccount = {
        ...subAccount,
        balance: subAccount.balance ? subAccount.balance.toNumber() : null,
        transactions: subAccountWithTransactions.transactions.map((subAccountTransaction) => ({
          id: subAccountTransaction.transaction.id,
          type: subAccountTransaction.transaction.type,
          description: subAccountTransaction.transaction.description,
          amount: subAccountTransaction.transaction.amount
            ? subAccountTransaction.transaction.amount.toNumber()
            : null,
          date: subAccountTransaction.transaction.date,
        })),
      };

      console.log("STEP 3 balance returned: ", balanceFloat);

      // Revalidate paths
      revalidatePath("/dashboard");
      revalidatePath(`/account/${data.accountId}`);

      return { success: true, data: serializedSubAccount };
    });
  } catch (error) {
    console.error("Error creating sub-account:", error.message);
    throw new Error(error);
  }
}

// Helper function to recursively update parent balances within a transaction
async function updateParentBalancesInTransaction(tx, subAccountId, balanceChange, visited = new Set()) {
  // Prevent infinite recursion with circular references
  if (visited.has(subAccountId)) {
    return;
  }
  
  visited.add(subAccountId);

  // Update the current account's balance
  await tx.subAccount.update({
    where: { id: subAccountId },
    data: {
      balance: {
        increment: balanceChange
      }
    }
  });

  // Find parent relation
  const parentRelation = await tx.subAccountRelation.findFirst({
    where: { childId: subAccountId },
    select: { parentId: true }
  });

  // If there's a parent, update it recursively
  if (parentRelation && parentRelation.parentId) {
    await updateParentBalancesInTransaction(tx, parentRelation.parentId, balanceChange, visited);
  }
}

export async function getSubAccounts(accountId) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch the user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // First, fetch the top-level subAccounts
    const topLevelSubAccounts = await db.subAccount.findMany({
      where: { accountId },
      include: {
        transactions: {
          include: {
            transaction: true,
          },
        },
      },
    });

    // Process each subAccount recursively
    const processedAccounts = await Promise.all(
      topLevelSubAccounts.map(async (account) => {
        return await fetchSubAccountWithChildren(account);
      })
    );

    return { success: true, data: processedAccounts };
  } catch (error) {
    console.error("Error in getSubAccountsWithDynamicDepth:", error.message);
    return { success: false, error: error.message };
  }
}

// Helper function to recursively fetch a subAccount and all its children
async function fetchSubAccountWithChildren(account, visited = new Set()) {
  // Prevent infinite recursion with circular references
  if (visited.has(account.id)) {
    return null;
  }
  
  visited.add(account.id);
  
  // Transform the current account
  const transformedAccount = {
    id: account.id,
    name: account.name,
    description: account.description,
    balance: account.balance ? account.balance.toNumber() : null,
    transactions: account.transactions
      ? account.transactions.map((subAccountTransaction) => ({
          id: subAccountTransaction.transaction.id,
          type: subAccountTransaction.transaction.type,
          description: subAccountTransaction.transaction.description,
          amount: subAccountTransaction.transaction.amount
            ? subAccountTransaction.transaction.amount.toNumber()
            : null,
          date: subAccountTransaction.transaction.date,
        }))
      : [],
    children: [],
  };
  
  // Fetch child relationships
  const childRelations = await db.subAccountRelation.findMany({
    where: { parentId: account.id },
    include: {
      child: {
        include: {
          transactions: {
            include: {
              transaction: true,
            },
          },
        },
      },
    },
  });
  
  // Process each child recursively
  if (childRelations.length > 0) {
    const childPromises = childRelations
      .filter(relation => relation.child)
      .map(async (relation) => {
        return await fetchSubAccountWithChildren(relation.child, new Set(visited));
      });
    
    transformedAccount.children = (await Promise.all(childPromises)).filter(Boolean);
  }
  
  return transformedAccount;
}
// export async function getSubAccounts(accountId) {
//   try {
//     // Authenticate the user
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     // Fetch the user
//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) throw new Error("User not found");

//     // Fetch sub-accounts with recursive relationships
//     const subAccounts = await db.subAccount.findMany({
//       where: { accountId },
//       include: {
//         parentOf: {
//           include: {
//             child: {
//               include: {
//                 parentOf: {
//                   include: {
//                     child: {
//                       include: {
//                         parentOf: {
//                           include: {
//                             child: {
//                               include: {
//                                 transactions: {
//                                   include: {
//                                     transaction: true,
//                                   },
//                                 },
//                               },
//                             },
//                           },
//                         },
//                         transactions: {
//                           include: {
//                             transaction: true,
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//                 transactions: {
//                   include: {
//                     transaction: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//         transactions: {
//           include: {
//             transaction: true,
//           },
//         },
//       },
//     });

//     // Handle empty or undefined results
//     if (!subAccounts || subAccounts.length === 0) {
//       return { success: true, data: [] };
//     }

//     // Transform the data to match the expected structure
//     const transformSubAccounts = (accounts, visited = new Map()) => {
//       if (!accounts) return [];
      
//       return accounts.map((account) => {
//         if (!account) return null;

//         // Check for circular references
//         if (visited.has(account.id)) {
//           return visited.get(account.id);
//         }

//         // Create transformed account object
//         const transformedAccount = {
//           id: account.id,
//           name: account.name,
//           description: account.description,
//           balance: account.balance ? account.balance.toNumber() : null,
//           transactions: [],
//           children: [],
//         };

//         // Store reference to avoid circular dependencies
//         visited.set(account.id, transformedAccount);

//         // Transform transactions
//         if (account.transactions && account.transactions.length > 0) {
//           transformedAccount.transactions = account.transactions.map((subAccountTransaction) => ({
//             id: subAccountTransaction.transaction.id,
//             type: subAccountTransaction.transaction.type,
//             description: subAccountTransaction.transaction.description,
//             amount: subAccountTransaction.transaction.amount
//               ? subAccountTransaction.transaction.amount.toNumber()
//               : null,
//             date: subAccountTransaction.transaction.date,
//           }));
//         }

//         // Process children recursively
//         if (account.parentOf && account.parentOf.length > 0) {
//           const childAccounts = account.parentOf
//             .filter(relation => relation.child)
//             .map(relation => relation.child);
          
//           transformedAccount.children = transformSubAccounts(childAccounts, visited);
//         }

//         return transformedAccount;
//       }).filter(Boolean); // Remove null entries
//     };

//     const transformedData = transformSubAccounts(subAccounts);

//     return { success: true, data: transformedData };
//   } catch (error) {
//     console.error("Error in getSubAccounts:", error.message);
//     return { success: false, error: error.message };
//   }
// }

