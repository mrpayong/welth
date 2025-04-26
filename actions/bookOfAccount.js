export async function createBook(type, startDate, endDate, accountId) {
    try {

        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
            id: accountId,
            userId: user.id,
            },
        });

        if (!account) {
            throw new Error("Account not found");
        }


      // Validate input parameters
      if (!type || !startDate || !endDate || !userId || !accountId) {
        throw new Error("Missing required parameters");
      }
      if (new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date must be earlier than or equal to end date");
      }
  
      // Determine transaction type
      const transactionType = type === "CASH_RECEIPT" ? "INCOME" : "EXPENSE";
  
      // Fetch transactions within the specified time frame
      const transactions = await db.transaction.findMany({
        where: {
          type: transactionType,
          accountId: accountId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
  
      // Calculate total debit and credit
      const totalDebit = transactions
        .filter((t) => t.isDebit)
        .reduce((sum, t) => sum + t.amount, 0);
  
      const totalCredit = transactions
        .filter((t) => !t.isDebit)
        .reduce((sum, t) => sum + t.amount, 0);
  
      // Create the book
      const book = await db.book.create({
        data: {
          type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          userId,
          accountId,
          totalDebit,
          totalCredit,
          transactions: {
            connect: transactions.map((t) => ({ id: t.id })),
          },
        },
      });
  
      // Return the created book
      return book;
    } catch (error) {
      console.error("Error creating book:", error.message);
      throw new Error("Failed to create book");
    }
  }