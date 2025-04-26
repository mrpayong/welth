"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = {...obj};

  if (obj.balance) {
      serialized.balance = Number(obj);
  }

  if (obj.amount) {
      serialized.amount = Number(obj);
  }

  return serialized;
};

const serializeAmount = (obj) => ({
    ...obj,
    amount: parseFloat(obj.amount.toFixed(2)),
});

export async function getCashOutflow(id) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactionExpenses = await db.account.findUnique({
      where: {
        id,
      },
      include: {
        transactions: {
          where: { type: "EXPENSE" },
          select:{
            Activity: true,
            accountId: true,
            amount: true,
            category: true,
            createdAt: true,
            date: true,
            description: true,
            id: true,
            receiptUrl: true,
            type: true,
            updatedAt: true,
            userId: true,
            refNumber:true
          }
        },
      },
    });

    if (!transactionExpenses) {
      throw new Error("Account not found");
    }

    const serializedTransactions = transactionExpenses.transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toNumber(), // Convert Decimal to number
      date: transaction.date.toISOString(), // Convert Date to string
    }));

    return serializedTransactions;

  } catch (error) {
    console.error("Error fetching account expenses:", error);
    throw new Error("Failed to fetch account expenses", error);
  }
}



// export async function getCashInflow(id) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const transactionIncome = await db.account.findUnique({
//       where: {
//         id,
//         userId: user.id,
//       },
//       include: {
//         transactions: {
//           where: { type: "INCOME" },
//         },
//       },
//     });

//     if (!transactionIncome) {
//       throw new Error("Account not found");
//     }

//     return transactionIncome.transactions;

//   } catch (error) {
//     console.error("Error fetching account Income:", error.message);
//     throw new Error("Failed to fetch account Income.");
//   }
// }
//////////////////////////////////////////////////////////////////////////////////
export async function getCashInflow(id) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactionIncome = await db.account.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        transactions: {
          where: { type: "INCOME" },
          select:{
            Activity: true,
            accountId: true,
            amount: true,
            category: true,
            createdAt: true,
            date: true,
            description: true,
            id: true,
            receiptUrl: true,
            type: true,
            updatedAt: true,
            userId: true,
            refNumber:true
          }
        },
      },
    });

    if (!transactionIncome) {
      throw new Error("Account not found");
    }

    // Serialize the data
    const serializedTransactions = transactionIncome.transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toNumber(), // Convert Decimal to number
      date: transaction.date.toISOString(), // Convert Date to string
    }));

    return serializedTransactions;
  } catch (error) {
    console.error("Error fetching account Income:", error.message);
    throw new Error("Failed to fetch account Income.");
  }
}





export async function createCashflow(transactionIds, take, subAccountIds, accountId, data) {
  try {

    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if (!user) {
        throw new Error("User not Found");
    }
    console.log("User found:", user);




    console.log("INPUTS TO API:", transactionIds, take, subAccountIds, accountId, data);
    // fetching all transactions
    let transactions = []; // Initialize transactions as an empty array

    const beginningBalance = take;
    if (isNaN(beginningBalance) || beginningBalance == 0) {
      throw new Error("Invalid beginning balance.") 
    }

    if (transactionIds && transactionIds.length > 0) {
      // Fetch transactions only if transactionIds is provided and not empty
      transactions = await db.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
        take, // beginning balance input
        select: {
          Activity: true,
          type: true,
          description: true,
          amount: true,
          date: true,
          accountId: true,
        },
      });
    }

  
    let subAccounts = []; // Initialize subAccounts as an empty array

    if (subAccountIds && subAccountIds.length > 0) {
      // Fetch sub-accounts only if subAccountIds is provided and not empty
      subAccounts = await db.SubAccount.findMany({
        where: {
          id: { in: subAccountIds },
          accountId: accountId,
        },
        select: {
          name: true,
          balance: true,
          transactions: {
            select: {
              transaction: {
                select: {
                  Activity: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    }
    

    const TransactionformattedAmount = transactions.map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount.toNumber().toFixed(3))
    }));
    console.log("sub accounts: ", subAccounts);


    // filter by Activity type
    const OpeTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "OPERATION"
    );
    const InvTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "INVESTMENT"
    );
    const FincTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "FINANCING"
    );



    // Calculate sum of amounts by type (INCOME, EXPENSE) before totalling 
    const OperatingIncomes = (transactions.length > 0 
      ? OpeTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "OPERATION" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);



    const OperatingExpenses = (transactions.length > 0 
      ? OpeTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "OPERATION" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const InvestingIncomes = (transactions.length > 0 
      ? InvTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "INVESTING" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const InvestingExpenses = (transactions.length > 0 
      ? InvTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "INVESTING" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);
     
    const FinancingIncomes = (transactions.length > 0 
      ? FincTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "FINANCING" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const FinancingExpenses = (transactions.length > 0 
      ? FincTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "FINANCING" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const totalOperating = OperatingIncomes - OperatingExpenses;
    const totalInvesting = InvestingIncomes - InvestingExpenses;
    const totalFinancing = FinancingIncomes - FinancingExpenses;

    console.log(totalOperating)

    // --- Calculate netChange ---
    const netChange = totalOperating + totalInvesting + totalFinancing;
    const endingBalance = beginningBalance + netChange

    const NeededData = transactions.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount), // Convert to string
      date: format(new Date(transaction.date), 'yyyy-MM-dd HH:mm:ss.SSSS')
    }));
 

    // required outputs:
    // 1. Total of each Activity type
    // 2. Net change
    // 3. beginning balance
    // 4. ending balance

    // const one = parseFloat(totalOperating.toFixed(3));
    // const two = parseFloat(totalInvesting.toFixed(3));
    // const three = parseFloat(totalFinancing.toFixed(3));

      const newCashflow = await db.cashFlow.create({
            data: {
              ...data,
              activityTotal: [totalOperating, totalInvesting, totalFinancing],
              netChange: Number(netChange.toFixed(3)),
              startBalance: Number(beginningBalance.toFixed(3)),
              endBalance: Number(endingBalance.toFixed(3)),
              createdAt: new Date(),

              description: NeededData?.description,
              date: new Date(),
              userId: user.id,
              accountId: accountId,
              transactions: transactionIds && transactionIds.length > 0 ? {
                connect: transactionIds.map((id) => ({ id })),
              } : undefined,
              subAccounts: subAccountIds && subAccountIds.length > 0 ? {
                create: subAccountIds.map((id) => ({
                  subAccount: {
                    connect: { id },
                  },
                })),
              } : undefined,
              userId: user?.id,
            },
          });


    

     console.log("THE NEW CASHFLOW: ", newCashflow);
    const cashflowWithTransactions = await db.cashFlow.findUnique({
      where: { id: newCashflow.id },
      include: { 
        transactions: transactionIds && transactionIds.length > 0 ? {
            select: {
              Activity: true,
              type: true,
              description: true,
              amount: true,
              date: true,
              accountId: true,
            },
          } : false,
          subAccounts: subAccountIds && subAccountIds.length > 0 ? {
            select: {
              subAccount: {
                select: {
                  name: true,
                  balance: true,
                  transactions: {
                    select: {
                      transaction: {
                        select: {
                          Activity: true,
                          type: true,
                        }
                      }
                    }
                  }
                },
              },
            },
          } : false,
      },
    });
    console.log("THE LAST STAGE: ", cashflowWithTransactions)
    
    const convertedTransactions = cashflowWithTransactions.transactions
      ? cashflowWithTransactions.transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
       }))
      : [];

    const serializedSubAccounts = cashflowWithTransactions.subAccounts
      ? cashflowWithTransactions.subAccounts.map((subAccount) => ({
        ...subAccount,
        subAccount: {
          ...subAccount.subAccount,
          balance: subAccount.subAccount.balance ? Number(subAccount.subAccount.balance) : null,
        },
        name: subAccount.subAccount.name || null,
        balance: subAccount.subAccount.balance ? Number(subAccount.subAccount.balance) : null,
      }))
      : [];

      console.log("tru",serializedSubAccounts)

      

    const convertedCashflow = {
      ...cashflowWithTransactions,
      transactions: convertedTransactions,
      subAccounts: serializedSubAccounts,
    }

    return {
      success: true,
      data: convertedCashflow
    };
  } catch (error) {
    console.error(error.message)
    throw new Error(error);
    
  }
}



export async function getCashflow(accountId, userId, cashFlowId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const cashflow = await db.cashFlow.findMany({
      where: {accountId}, // Filter by accountId
      orderBy: { createdAt: "desc" }, // Order by descending createdAt
      include: {  
       transactions: {
        select: {
          id: true,
          type: true,
          description: true,
          amount: true,
          Activity: true,
          date: true,
        }
       },
        account: {
          select:{
            name: true,
            id: false,
          },
          
        } // Include associated transactions
      },
    });

    if (!cashflow) {
      // No cashflow records found for the account
      console.log("No cashflow records found for account ID: ", accountId);
      return; // Or handle the case as needed
    }

    // Convert Decimal objects to numbers (if necessary)
    const convertedCashflows = cashflow.map((cf) => {
      const convertedTransactions = cf.transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        // Convert other Decimal properties if any
      }));


      return {
        ...cf,
        transactions: convertedTransactions,
      };
    });
console.log("THE CASHFLOW DATA FROM BACKEND",convertedCashflows)

    return convertedCashflows;
  } catch (error) {
    console.error("Error fetching cashflow:", error);
    throw new Error("Failed to fetch cashflow");
  }
}

























// export async function getCashflowById(cfsID) {
//   try {
//     const cashflow = await db.cashFlow.findUnique({
//       where: { id: cfsID }, // Fetch by cashflow ID
//       include: {
//         transactions: {
//           select: {
//             id: true,
//             type: true,
//             description: true,
//             amount: true,
//             Activity: true,
//             date: true,
//           },
//         },
//         subAccounts: {
//           select: {
//             subAccountId: true,
//             subAccount: {
//               select: {
//                 id: true, // Include sub-account ID
//                 name: true,
//                 balance: true,
//                 transactions: {
//                   select: {
//                     transaction: {
//                       select: {
//                         type: true,
//                         Activity: true
//                       }
//                     }
//                   },
//                 },
//               },
//             },
//           },
//         },
//         account: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     if (!cashflow) {
//       console.log("Cashflow not found for ID:", cfsID);
//       return null;
//     }

//     console.log("sub account in cashflow:", cashflow);

//     // Convert Decimal objects to numbers and Date objects to strings
//     const convertedTransactions = cashflow.transactions.map((transaction) => ({
//       ...transaction,
//       amount: Number(transaction.amount), // Convert Decimal to number
//       date: transaction.date.toISOString(), // Convert Date to string
//     }));

//     const convertedSubAccounts = cashflow.subAccounts.map((subAccountRelation) => ({
//       id: subAccountRelation.subAccount?.id || subAccountRelation.subAccountId, // Use subAccountId as fallback
//       name: subAccountRelation.subAccount?.name || null, // Safely access the name
//       balance: subAccountRelation.subAccount?.balance
//         ? Number(subAccountRelation.subAccount.balance)
//         : null, // Safely access and convert balance
//         transactions: subAccountRelation.subAccount?.transactions.map((transaction) => ({
    
//           type: transaction.type,
//           Activity: transaction.Activity,
//         })),
//     }));

//     console.log("converted sub accounts: ", convertedSubAccounts) 
//     return {
//       ...cashflow,
//       transactions: convertedTransactions,
//       subAccounts: convertedSubAccounts,
//     };
//   } catch (error) {
//     console.error("Error fetching cashflow by ID:", error);
//     throw new Error("Failed to fetch cashflow by ID");
//   }
// }

function flattenNestedTransactions(subAccount) {
  let transactions = [];

  // If the current sub-account has a transaction, use it
  if (subAccount.transactions && subAccount.transactions.length > 0) {
    const transaction = subAccount.transactions[0]; // Use the single transaction
    transactions.push({
      id: transaction.transaction.id,
      type: transaction.transaction.type,
      Activity: transaction.transaction.Activity,
      amount: Number(transaction.transaction.amount), // Convert Decimal to number
      description: transaction.transaction.description,
      date: transaction.transaction.date.toISOString(), // Convert Date to string
    });
  }

  // If the current sub-account has child sub-accounts, recursively fetch their transactions
  if (subAccount.parentOf && subAccount.parentOf.length > 0) {
    subAccount.parentOf.forEach((childLink) => {
      const childTransactions = flattenNestedTransactions(childLink.child);
      transactions.push(...childTransactions);
    });
  }

  return transactions;
}

export async function getCashflowById(cfsID) {
  try {
    const cashflow = await db.cashFlow.findUnique({
      where: { id: cfsID },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            description: true,
            amount: true,
            Activity: true,
            date: true,
          },
        },
        subAccounts: {
          select: {
            subAccountId: true,
            subAccount: {
              select: {
                id: true,
                name: true,
                balance: true,
                transactions: {
                  take: 1, // Fetch only one transaction
                  include: {
                    transaction: {
                      select: {
                        id: true,
                        type: true,
                        Activity: true,
                        amount: true,
                        description: true,
                        date: true,
                      },
                    },
                  },
                },
                parentOf: {
                  include: {
                    child: {
                      select: {
                        id: true,
                        name: true,
                        transactions: {
                          take: 1, // Fetch only one transaction for child sub-accounts
                          include: {
                            transaction: {
                              select: {
                                id: true,
                                type: true,
                                Activity: true,
                                amount: true,
                                description: true,
                                date: true,
                              },
                            },
                          },
                        },
                        parentOf: {
                          include: {
                            child: {
                              select: {
                                id: true,
                                name: true,
                                transactions: {
                                  take: 1, // Fetch only one transaction for deeper nested sub-accounts
                                  include: {
                                    transaction: {
                                      select: {
                                        id: true,
                                        type: true,
                                        Activity: true,
                                        amount: true,
                                        description: true,
                                        date: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        account: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!cashflow) {
      console.log("Cashflow not found for ID:", cfsID);
      return null;
    }

    // Serialize transactions
    const convertedTransactions = cashflow.transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      date: transaction.date.toISOString(),
    }));

    // Serialize sub-accounts
    const convertedSubAccounts = cashflow.subAccounts.map((subAccountRelation) => {
      const subAccount = subAccountRelation.subAccount;

      // Use helper function to flatten transactions
      const transactions = flattenNestedTransactions(subAccount);

      return {
        id: subAccount?.id || subAccountRelation.subAccountId,
        name: subAccount?.name || null,
        balance: subAccount?.balance ? Number(subAccount.balance) : null,
        transactions,
      };
    });

    return {
      ...cashflow,
      transactions: convertedTransactions,
      subAccounts: convertedSubAccounts,
    };
  } catch (error) {
    console.error("Error fetching cashflow by ID:", error);
    throw new Error("Failed to fetch cashflow by ID");
  }
}






























export async function updateCashflow(cashflowId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // Fetch the original cashflow
    const originalCashflow = await db.cashFlow.findUnique({
      where: { id: cashflowId },
      include: { transactions: true, subAccounts: true },
    });
    if (!originalCashflow) throw new Error("Cashflow not found.");

    // Validate input data
    if (typeof data.startBalance !== "number") {
      throw new Error("Invalid startBalance: must be a number");
    }
    if (data.transactionIds && !Array.isArray(data.transactionIds)) {
      throw new Error("Invalid transactionIds: must be an array");
    }
    if (data.subAccountIds && !Array.isArray(data.subAccountIds)) {
      throw new Error("Invalid subAccountIds: must be an array");
    }

    // Update the cashflow
    const updatedCashflow = await db.cashFlow.update({
      where: { id: cashflowId },
      data: {
        startBalance: data.startBalance,
        subAccounts: data.subAccountIds
          ? {
              set: data.subAccountIds.map((id) => ({ id })), // Update associated subaccounts
            }
          : undefined,
        transactions: data.transactionIds
          ? {
              set: data.transactionIds.map((id) => ({ id })), // Update associated transactions
            }
          : undefined,
      },
      include: {
        transactions: true,
        subAccounts: true,
      },
    });

    // Revalidate paths
    revalidatePath(`/CashflowStatement/${originalCashflow.accountId}`);
    revalidatePath(`/CashflowStatement/${originalCashflow.accountId}/${cashflowId}`);

    return { success: true, data: updatedCashflow };
  } catch (error) {
    console.error("Error updating cashflow:", error);
    return { success: false, error: error.message || "Failed to update cashflow" };
  }
}


export async function deleteCashflow(cashflowId) {
  console.log("THE BACKEND",cashflowId)
  try {
    console.log('Starting delete cashflow: ');

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    console.log('User found:', user);

    const cfsId = cashflowId
    console.log('Cashflow IDs:', cfsId);

    const cashflow = await db.cashFlow.findUnique({
      where: {
        id: cfsId,
        userId: user.id,
      },
      select: {
        id: true,
      }
    });

    if (!cashflow) {
      throw new Error('Cashflow not found or unauthorized');
    }
    console.log('Cashflow found:', cashflow);

    await db.cashFlow.delete({
      where: {
        id: cashflowId,
      },
    });

    console.log('Cashflow deleted');

    return { success: true, message: "Cancelled creating Cashflow Statement"};
  } catch (error) {
    console.error('Error cancelling Cashflow creation:', error);
    return { success: false, error: error.message };
  }
}