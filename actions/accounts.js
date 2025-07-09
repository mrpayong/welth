"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { sub } from "date-fns";
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

async function archiveEntity({
  userId,
  accountId,
  action,
  entityType,
  entityId,
  data,
}) {
  try {
    await db.archive.create({
      data: {
        userId,
        accountId,
        action,
        entityType,
        entityId,
        data,
      },
    });

    return;
  } catch (error) {
    console.error("Error archiving entity:", error);
    return { success: false, error: error.message || "Archiving failed" };
  }
}


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

        if (user.role !== "STAFF"){
          return {authorized: false, reason: "User Admin !=1&&0"};
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
       if (user.role !== "STAFF"){
        throw new Error("Unavailable action")
       }

        // fetching all transactions
        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds},
                userId: user.id,
            },
            select:{
              id: true,
              accountId: true,
              amount:true,
              description: true,
              particular: true,
              createdAt: true, 
            }
        });
            console.log("Fetched transactions:", transactions);

        for (const transaction of transactions) {
          await archiveEntity({
            userId: user.id,
            accountId: transaction.accountId,
            action: "deleteTransaction",
            entityType: "Transaction",
            entityId: transaction.id,
            data: transaction,
          });
        }

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
        

        console.log("Paths revalidated");

        return {success: true};
    } catch (error) {
      console.error("Error in bulkDeleteTransactions:", error);
      return {success: false, error: error.message};
    }
}

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
      console.log("Parent sub account has no transactions. Skipping Activity validation.");
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


async function validateParentSubAccount(data) {
  console.log("validateParentSubAccount testing: ", data)
      if (data.parentName) {
        console.log(".$transaction[1]: finding parentName in db")
        const fetchSubAccount = await db.subAccount.findFirst({
          where: { name: data.parentName },
        });
        console.log(`fetchSubAccount. Null if no existing parent Sub account wit name ${data.parentName}`, fetchSubAccount)
        if (!fetchSubAccount) {
          throw new Error(`Parent sub account with name "${data.parentName}" not found`);
        }
        const dataFetched = {
          ...fetchSubAccount,
          balance: Number(fetchSubAccount.balance)
        };
        console.log("returning dataFetched to server action", dataFetched)
        return {parentSubAccount: dataFetched, success: true, message: "A matching parent name was found"}
      } 
      
      console.log("testing validateParentSubAccount", data)
      return {parentSubAccount: data, success: false, message: "No matching parent name."}
}

async function createSubAccountHelper(data, balanceFloat, isValidateParentSubAccount){
  console.log("[5.4] Creating Sub Account")
  console.log("[5.4]", data, balanceFloat, isValidateParentSubAccount)
  // Instances to create: 
  //    A. Parent account creation
  //    B. Child inserting to Parent Account
  //    C. Parent account creation with transactions
  // if parentSubAccountValidated.success === false && transactionIds.length = 0 
  // skip [5.1] parent matching and [5.2] Parent and Passed Data, Activity matching
  try {
     if (isValidateParentSubAccount === false || data.name){
        console.log("[5.4] Passed In data attaching")
        const subAccount = await db.subAccount.create({
          data: {
            name: data.name,
            description: data.description,
            balance: balanceFloat,
            accountId: data.accountId,
          },
        });
        console.log("Sub-account created:", subAccount);
        return subAccount;
      } else {
        console.log("[5.4] No New Sub Account created")
        console.log("[5.4] Inserting transactions to existing Parent Sub Account only.")
        console.log("Exit [5.4]", data)
        return data;
      } 
    
  } catch (error) {
    console.log("[5.4] Error creating sub account", error.message)
    throw new Error("[5.4] Error creating sub account")
  }
}


// Helper function to recursively update parent balances within a transaction
async function updateParentBalancesInTransaction(tx, subAccountId, balanceChange, visited = new Set()) {
  // Prevent infinite recursion with circular references
  console.log("updateParentBalancesInTransaction[5.7]", subAccountId,"[5.7]", balanceChange, visited)
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
  console.log("[5.7] ", parentRelation)
  // If there's a parent, update it recursively
  if (parentRelation && parentRelation.parentId) {
    await updateParentBalancesInTransaction(tx, parentRelation.parentId, balanceChange, visited);
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

    if(user.role !== "STAFF"){
      throw new Error("You are not allowed to do this action")
    }

    console.log("PASSED DATA: ", data, transactionIds);


    if(data.name) {
      console.log("Checking the New Group Name.")
      const existingSubAccountName = await db.subAccount.findFirst({
        where: {
          name: data.name
        }
      })
      if(existingSubAccountName){
        console.log("The New Group Name already exists.")
        throw new Error("The New Group Name already exists.")
      }
    }

    // Fetch transactions using passed transaction IDs
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

    // Transaction type and Activity type consistency validations
        // validate transcations to have same transaction type
    const validationResult = validateTransactionTypes(transactions);
      if (!validationResult.success) {
        throw new Error("Select Transactions with same type (INCOME or EXPENSE).");
    }

        // validate transcations to have same "ACTIVITY" type
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
      // let parentSubAccount = null;
      // if (data.parentName) {
      //   console.log(".$transaction[1]: finding parentName in db")
      //   parentSubAccount = await tx.subAccount.findFirst({
      //     where: { name: data.parentName },
      //   });
      //   console.log(`fetchSubAccount. Null if no existing parent Sub account wit name ${data.parentName}`, fetchSubAccount)
      //   if (!fetchSubAccount) {
      //     throw new Error(`Parent sub account with name "${data.parentName}" not found`);
      //   }

      // }
      console.log("[5]")

      console.log("[5.1] parent checking") // check if the inputted parentName is existent. if No parentName inputted still proceed.
      const parentSubAccountValidated = await validateParentSubAccount(data) // ------> db.subAccount.findFirst
      // return error message if inputted parentName is non-existent
      console.log("parentSubAccountValidated returned: ", parentSubAccountValidated)
      if(parentSubAccountValidated.success === true){
        console.log("[5.1] Parent Sub Account was found")
      } else {
        console.log("[5.1] Parent Sub Account was not found")
        console.log("[5.1] Continue process with: ", parentSubAccountValidated.parentSubAccount)
      }
      const parentSubAccount = parentSubAccountValidated.parentSubAccount;
      console.log(".parentSubAccountt is: ", parentSubAccount)



      console.log("[5.2] Parent and Passed Data, Activity matching") 
      //if parent sub account exist 
      // check if the Activity type of transactions in the parent sub account matches with the passed in transactions
      if (parentSubAccountValidated.success === true && transactionIds && transactionIds.length > 0) {
            // findMany method on Explicit Many-to-Many relation of subAcc and transaction
            // because of explicit relation type we can tap into the addtional data of related model
            console.log("[5.2] Fetching relating transaction data of Parent Sub Account")
            const parentTransactions = await tx.subAccountTransaction.findMany({
              // bring in Activity type of transactions
              where: { subAccountId: parentSubAccount.id },
              include: {
                transaction: {
                  select: { Activity: true },
                },
              },
            });
      
            // Since parent sub account exists. Check if the parent sub-account has no transactions. 
            // Activity type of transaction that is going into a sub account
            // Must have same Activity type with existing Transactions in the sub account
            if (parentTransactions.length === 0) {
              // note: this stops the process for INSERTING transactions only
              console.log("Parent sub account has no transactions. Skipping Activity validation.");
              // return { success: true, parentSubAccount: parentSubAccount }; // Skip validation and proceed
            } else {
              // because Activity type and transaction type is checked before $transactions
              // all transactions in a sub account have same Activity type and transaction type
              // that is why only need to check one data of the parent sub account
              const parentActivity = parentTransactions[0]?.transaction.Activity;
        
              // Extract the Activity of the passed-in transactions (already fetched earlier)
              const transactionActivity = transactions[0]?.Activity;
        
              // Compare the Activity of the parent sub-account and the passed-in transactions
              if (parentActivity !== transactionActivity) {
                throw new Error(`The ${transactionActivity} activities does not match the ${parentActivity} activities.`);
              }              
            }
      } else {
        console.log("This is Mother account. Skipping Activity validation:", parentSubAccount);
        console.log("Exit [5.2]")
        // return { success: true, parentSubAccount: parentSubAccount }; 
      }

      console.log("[5.3] Parent and Passed Data, type matching") 
      if (parentSubAccountValidated.success === true && transactionIds && transactionIds.length > 0) {
          const parentTransactions = await tx.subAccountTransaction.findMany({
          where: { subAccountId: parentSubAccount.id },
          include: {
            transaction: {
              select: { type: true },
            },
          },
        });

        // Check if the parent sub-account has no transactions
        if (parentTransactions.length === 0) {
          console.log("Parent sub account has no transactions. Skipping type validation.");
          // return { success: true, parentSubAccount: parentSubAccount }; // Skip validation and proceed
        } else {
          const parentType = parentTransactions[0]?.transaction.type;

          // Extract the type of the passed-in transactions (already fetched earlier)
          const transactiontype = transactions[0]?.type;

          // Compare the type of the parent sub-account and the passed-in transactions
          if (parentType !== transactiontype) {
            throw new Error(`The ${transactiontype} type does not match the ${parentType} type.`);
          }
        }
      } else {
        console.log("This is Mother account. Skipping type validation:", parentSubAccount);
        console.log("Exit [5.3]")
        // return { success: true, parentSubAccount: parentSubAccount }; 
      }

     

      const subAccount = await createSubAccountHelper(data, balanceFloat, parentSubAccountValidated.success)
      console.log("[5.4] subAccount returned", subAccount)

      // Link transactions to the sub-account
      // create the actual relation of Passed in transactions and Newly created sub account(for Sub_Account_Transaction Database model)
      // this is only if there are passed in transactionsIds

      //    MAIN PROBLEM: PARENT SUB ACCOUNT AND TRANSACTIONS RELATION NOT CREATED WHEN INSERTING ONLY. (MEANS NO DATA.NAME IS PASSED)
      if ((subAccount.id || parentSubAccount.id) && transactionIds && transactionIds.length > 0) {
        console.log("[5.5] Create New Sub account and Transactions Relation")
        try {
          await tx.subAccountTransaction.createMany({
            data: transactionIds.map((transactionId) => ({
              subAccountId: subAccount.id || parentSubAccount.id, 
              transactionId,
            })),
          });          
        } catch (error) {
          console.log("Checked SubAcc_Transaction relation. One or many tranasctions already related")
          console.log("[5.5] Transactions already related to this Sub Account. Check selected transactions")
          throw new Error("[5.5] Transactions already related to this Sub Account. Check selected transactions.")
        }


        // this logic does not work without newly created Sub Account
        // subAccount.create() works if there is a Parent Sub Account that is found. 
        // but subAccount.create() needs to work when:
        //    A. data.name && data.parentName (This means an account is being inserted in a parent sub account)
        //    B. data.name && !data.parentName (This means user is creating a new mother acocunt) _done
        // Sub account and Transaction relation will be created when 
        //    A. only data.name is passed (Means creating mother with transactions)
        //    B. only data.parentName is passed (Means inserting transaction to existing parent sub account)
        //    C. data.name and data.parentName is Passed (Means inserting a child sub account w/ transactions to parent sub account)
      
      } else {
        console.log("No passed in transactions. No New Sub account and Transactions Relations created.", parentSubAccount)
        console.log("Exit [5.5]")
        // return {success: false, parentSubAccount: parentSubAccount}
      }

      // Create parent-child relationship if a parent is found in database
      // create the actual relation of fetched Parent Sub Account and Newly created sub account(for Sub_Account_Transaction Database model)
      // this is only if there is fetched Parent Sub Account
      console.log("[5.6]", parentSubAccountValidated)
      if (parentSubAccountValidated.success === true && data.name){
        console.log("[5.6] Create Parent and Child Sub Account Relation")
        console.log("[5.6] parentSubAccount", parentSubAccount)
        console.log("[5.6] subAccount",subAccount)
        // this will only be triggered when 
        await tx.subAccountRelation.create({
          data: {
            parentId: parentSubAccount.id,  // this is the id of the Parent subAccount
            childId: subAccount.id,    // this is the id of the newly created sub account
            relationName: `${parentSubAccount.name} -> ${subAccount.name}`
          }
        })

        console.log(`Relationship created between "${parentSubAccount.name}" and "${subAccount.name}"`);

        // Recursively update all parent balances up the hierarchy
        // will updated balance of Parent Sub account or Parent Sub accounts up the hierarchy 

        
      } else {
        console.log("This is mother account. No Parent and New Child Sub Account Explicit Relations created", parentSubAccount)
        console.log("Exit [5.6]")
        // return {success: true, parentSubAccount: parentSubAccount}
      }

      console.log("[5.7] Update Parent Sub Account Balance")
      if(parentSubAccountValidated.success === true){
        console.log("[5.7] Parent Sub Account is: ", parentSubAccount)
        await updateParentBalancesInTransaction(tx, parentSubAccount.id, balanceFloat);
      } else {
        console.log("[5.7] No Parent Sub Account to update")
      }

      // Fetch the newly created sub-account WITH it's transactions (maintaining serialization)
      // console.log("[5.7] Fetch db for Newly created Sub Account WITH it's transactions")
      // const subAccountWithTransactions = 
      // if(data.name && validateParentSubAccount.success === true)
      // await tx.subAccount.findUnique({
      //   where: { id: subAccount.id },
      //   include: {
      //     transactions: {
      //       include: {
      //         transaction: true,
      //       },
      //     },
      //   },
      // });


      // console.log("[5.8] Serialization")
      // const serializedSubAccount = {
      //   ...subAccount,
      //   balance: subAccount.balance ? subAccount.balance.toNumber() : null,
      //   transactions: subAccountWithTransactions.transactions.map((subAccountTransaction) => ({
      //     id: subAccountTransaction.transaction.id,
      //     type: subAccountTransaction.transaction.type,
      //     description: subAccountTransaction.transaction.description,
      //     amount: subAccountTransaction.transaction.amount
      //       ? subAccountTransaction.transaction.amount.toNumber()
      //       : null,
      //     date: subAccountTransaction.transaction.date,
      //   })),
      // };

      console.log("STEP 3 balance returned: ", balanceFloat);

      revalidatePath("/dashboard");
      
      console.log("[5.8] Success Creating")
      return { success: true, 
        // data: serializedSubAccount 
      };
    });
  } catch (error) {
    console.error("Error creating sub-account:", error.message);
    throw new Error(error);
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
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
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


export async function updateSubAccountBalance(newBalance, subAccountId){
  try {
    console.log("[1] Auth")
    const {userId} = await auth();

    const user = await db.user.findUnique({
      where: { clerkUserId: userId},
    });

    if (!user){
      throw new Error("Unauthorized");
    };
    if (user.role !== "STAFF"){
      throw new Error("Unavailable action");
    };

    console.log("[2] Fetch Sub Account");
    const subAccount = await db.subAccount.findUnique({
      where: {id: subAccountId },
      select: {
        id: true,
        balance: true,
        accountId: true,
      }
    });
    if(!subAccount){
      throw new Error("[2] Sub Account not found");
    }

    console.log("[3] Update Sub Account Balance")
    const udpatedSubAccount = await db.subAccount.update({
      where: { id: subAccount.id },
      data: {
        balance: newBalance,
        updatedAt: new Date()
      }
    });

    revalidatePath(`/SubAccounts/${subAccount.accountId}`)
    console.log("[4] Success update")
    return {success: true}
  } catch (error) {
    console.log("Error updating balance")
    console.info("Error udpating:", error.message)
    throw new Error("Error updating balance")
  }
}

export async function deleteSubAccountTransactionRelation(subAccountId, transactionId) {
  try {
    console.log("[1] Auth");
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
    if (user.role !== "STAFF") throw new Error("Unavailable action");

    console.log("[2] Check Data existance");
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
      }
    });
    if (!transaction){
      throw new Error("[2] Transaction not found")
    }

    const subAccount = await db.subAccount.findUnique({
      where: {id: subAccountId},
      select: {
        id: true,
        accountId: true,
      }
    })
    if(!subAccount){
      throw new Error("[2] Sub Account not found")
    }



    
    const relation = await db.subAccountTransaction.findUnique({
      where: {
        subAccountId_transactionId: {
          subAccountId: subAccount.id,
          transactionId: transaction.id,
        },
      },
    });
    if (!relation) {
      throw new Error("[2] Relation not found");
    }

    console.log("[3] Delete Relation");
    await db.subAccountTransaction.delete({
      where: {
        subAccountId_transactionId: {
          subAccountId: subAccount.id,
          transactionId: transaction.id,
        },
      },
    });

    revalidatePath(`/SubAccounts/${subAccount.accountId}`);
    console.log("[4] Success delete");
    return { success: true };
  } catch (error) {
    console.log("Error deleting subAccount-transaction relation");
    console.info("Error:", error.message);
    throw new Error("Error deleting subAccount-transaction relation");
  }
}

export async function deleteSubAccount(subAccountId) {
  try {
    console.log("[1] Auth");
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user){
      throw new Error("User not found");
    }
    if (user.role !== "STAFF"){ 
      throw new Error("Unavailable action");
    }

    console.log("[2] Fetching group");
    const subAccount = await db.subAccount.findUnique({
      where: { id: subAccountId },
      select: {
        id: true,
        accountId: true, 
        balance: true,
        name: true,
        description: true,
        createdAt: true,
      }
    })
    if(!subAccount){
      throw new Error("[2] Sub Account not found.")
    }

    await archiveEntity({
      userId: user.id,
      accountId: subAccount.accountId,
      action: "deleteSubAccount",
      entityType: "SubAccount",
      entityId: subAccount.id,
      data: subAccount,
    });

    console.log("[3] Deleting group", subAccount.id);
    await db.subAccount.delete({
      where: {id: subAccount.id }
    })
    

   

    revalidatePath("/dashboard");
    revalidatePath("/account/");
    console.log("[4] Success delete");
    return { success: true };
  } catch (error) {
    console.log("Error deleting group");
    console.info("Error:", error.message);
    throw new Error("Error deleting group");
  }
}

