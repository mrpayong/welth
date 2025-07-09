"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getSuggestedWeeklySchedule() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
    });

    if (!user) {
      throw new Error("User not found.");
    }
    if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  // Fetch all tasks for the user
  console.log("retrieving Tasks Data")
  const tasks = await db.Task.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      taskName: true,
      urgency: true,
      dueDate: true,
      taskCategory: true,
      taskDescription: true,
    },
  });
  console.log("retrieved Tasks Data:", tasks.length)

  console.log("feeding to prompt...")
  // Prepare prompt
  const prompt = `
You are an expert task management assistant for an accounting firm in the Philippines. 
Given the following list of tasks, suggest a weekly schedule (Sunday to Saturday) for the user. 
Prioritize tasks with higher urgency and earlier due dates. 
Distribute the workload evenly if possible, but urgent tasks should be scheduled earlier in the week. 

You also have a keen understanding of prioritization.
Given the current date, the current day of the week, and a comprehensive list of all active tasks
(including any newly added ones) with their urgency and due dates, by analyzing the given data of task from the database,
provide only the data-driven suggestion about the most critical and actionable tasks that can realistically be started or completed *today*. 
Keep it friendly and yet professional and short, do not include the task ID only neccessary and easy-to-read data.

   **Important instructions:**
   - example output of the suggested weekly schedule:
   {
     "Sunday": [
        { "taskId": "1", 
          "taskName": "Prepare financial report", 
          "dueDate": "2024-10-01T00:00:00.000Z", 
          "urgency": "HIGH", 
          "taskDescription": "Prepare the monthly financial report for the client." },
        { "taskId": "2", "taskName": "Review tax documents", "dueDate": "2024-10-02T00:00:00.000Z", "urgency": "MEDIUM", "taskDescription": "Review the client's tax documents for accuracy." }
      ],
      "Monday": [
          { "taskId": "3", "taskName": "Client meeting", "dueDate": "2024-10-03T00:00:00.000Z", "urgency": "HIGH", "taskDescription": "Meet with the client to discuss their financial situation." }
        ],
      ...,
    }

Tasks:
${JSON.stringify(tasks, null, 2)}


Only respond with valid JSON in this exact format, Starting from Sunday and ending to Saturday:
{
  "Day of the Week": [
    "taskId": "string", 
    "taskName": "string", 
    "dueDate": "ISO date string",
    "urgency": "string", 
    "taskDescription": "string",
    ],
  "insight": "string",
}
`

;

console.log("prompt success and ready.")
  // Call Gemini
console.log("cleaning data")
  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  console.log("cleanedText:", cleanedText);
 
    const schedule = JSON.parse(cleanedText);
 
  console.log("Generated sched:", schedule);

  return schedule;
}

export async function getInflowOutflowForecast(accountId){
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Fetch all transactions for the user
  console.log("retrieving Transactions Data")
  const inflows = await db.Transaction.findMany({
      where: { 
        userId: user.id,
        accountId, 
        type: "INCOME" 
      },
      select: { 
        amount: true, 
        date: true, 
      },
      orderBy: { date: "asc" },
    });

    // Fetch EXPENSE transactions
    const outflows = await db.Transaction.findMany({
      where: { 
        userId: user.id,
        accountId, 
        type: "EXPENSE" 
      },
      select: { 
        amount: true, 
        date: true, 
      },
      orderBy: { date: "asc" },
    });

function accumulateByMonth(transactions) {
  const monthly = {};
  for (const tx of transactions) {
    const month = tx.date.toISOString().slice(0, 7); // "YYYY-MM"
    if (!monthly[month]) {
      monthly[month] = { amount: 0, count: 0 };
    }
    monthly[month].amount += Number(tx.amount);
    monthly[month].count += 1;
  }
  // Return sorted array of { month, amount, count }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, amount: data.amount, count: data.count }));
}


  const monthlyInflows = accumulateByMonth(inflows);
  const monthlyOutflows = accumulateByMonth(outflows);
  console.log("before prompt: ",monthlyInflows)
  console.log("before prompt: ",monthlyOutflows)
  console.log("feeding to prompt...")
  // Prepare prompt
  const prompt = `
  You are an expert financial analyst for an accounting firm in the Philippines.
  Given the following monthly inflow (income) and outflow (expense) data, forecast the total inflows and outflows for the next quarter (3 months) using the Moving Average method.

  **Important instructions:**
  - Output must be a JSON object.
  - Only include two arrays: "inflowForecast" and "outflowForecast".
  - Each array should contain three objects, one for each of the next three months, with "month" (YYYY-MM) and "amount" (number).
  - Do not include any explanations, insights, or extra text outside the JSON.

  Example output:
  {
    "inflowForecast": [
      { "month": "2025-07", "amount": 12345 },
      { "month": "2025-08", "amount": 23456 },
      { "month": "2025-09", "amount": 34567 }
    ],
    "outflowForecast": [
      { "month": "2025-07", "amount": 5432 },
      { "month": "2025-08", "amount": 6543 },
      { "month": "2025-09", "amount": 7654 }
    ]
  }

  Historical Monthly Inflows:
  ${JSON.stringify(monthlyInflows, null, 2)}

  Historical Monthly Outflows:
  ${JSON.stringify(monthlyOutflows, null, 2)}

  Only respond with valid JSON in this exact format:
  {
    "inflowForecast": [
      { "month": "YYYY-MM", "amount": "number" },
      ...
    ],
    "outflowForecast": [
      { "month": "YYYY-MM", "amount": "number" },
      ...
    ]
  }
  `;


  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  const forecast = JSON.parse(cleanedText);

 return {
    historical: {
      inflows: monthlyInflows,
      outflows: monthlyOutflows,
    },
    inflowForecast: forecast.inflowForecast,
    outflowForecast: forecast.outflowForecast,
  };
}

export async function getCashflowForecast(accountId) {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Find user in DB
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });
  if (!user) throw new Error("User not found.");
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Fetch only monthly cashflow statements for the user, selecting only date and netChange
  const cashflows = await db.cashFlow.findMany({
    where: {
      userId: user.id,
      accountId,
      periodCashFlow: "MONTHLY",
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      netChange: true,
      startBalance: true,
      endBalance: true,
      activityTotal: true,
    },
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  

  // Prepare prompt for Gemini
  const prompt = `
    You are an expert financial data analyst in an Accounting firm in the Philippines with clients that are also located in the Philippines. 
    Given the cashflow data with monthly gross cashflow (netChange) values, 
    forecast the gross cashflow for the next quarter (3 months) using the Moving Average method.
    The activityTotal is an array of the total activities it is: [totalOperating, totalInvesting, totalFinancing].
    Make an insight about the cashflow trends and potential accounting legal compliance issues that may 
    come up base on the historical cashflow data provided to prevent penalties and compliance issues with the Bureau of Internal Revenue. 
    List at least four possible financial legal compliance issues base on the historical cashflow data provided. 
    If no possible financial legal compliance issues can be seen, then make suggestion for improvements, do not give suggestion for improvement 
    if there are visible financial legal compliance issues. Keep it short and professional.
    Return the forecast as a JSON object with each forecasted month and amount, and a brief insight.
    
    **Important instructions:**
    - The "issuesOrImprovements" field must be an array of at least four short phrases (not sentences).
    - Do not use full sentences. Each array item should be a phrase only.
    - Do not include explanations or extra text outside the JSON.
    - Example output:
    {
      "forecast": [
        { "month": "2025-07", "amount": 12345 },
        { "month": "2025-08", "amount": 23456 },
        { "month": "2025-09", "amount": 34567 }
      ],
      "insight": "Steady cashflow growth observed.",
      "issuesOrImprovements": [
        "Delayed VAT remittance",
        "Incomplete expense documentation",
        "Unreconciled bank statements",
        "Late tax filing"
      ]
    }
    Gross Cashflow Data:
    ${JSON.stringify(cashflows, null, 2)}

    Only respond with valid JSON in this exact format:
    {
      "forecast": [
        { "month": "YYYY-MM", "amount": "number" },
        ...
      ],
      "insight": "string",
      "issuesOrImprovements": [
        "string",
        "string",
        "string",
        "string",
        ...
      ]
    }
    `;

  // Call Gemini 1.5 Flash

  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  // Parse and return the forecast
  const forecast = JSON.parse(cleanedText);
  console.log("Generated forecast:", forecast)
  return {
    historical: cashflows.map(cf => ({
      month: cf.date.toISOString().slice(0, 7), // "YYYY-MM"
      netChange: cf.netChange,
    })),
    forecast: forecast.forecast,
    insight: forecast.insight,
    issuesOrImprovements: forecast.issuesOrImprovements,
  };
  
}



export async function getOverallFinancialDataAnalysis({ cashflowForecast, inflowOutflowForecast }) {
  try {
    
  
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true, // Include role to check if user is ADMIN
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  
  console.log("feeding to prompt...")
  const prompt = `
    You are an expert financial data analyst working in an Accounting firm based in the Philippines, 
    serving clients who are also based in the Philippines. You specialize in interpreting financial forecasts and historical trends, 
    with a focus on practical, high-impact business recommendations relevant to the local economic context.

    Using the data provided below — which includes the forecast of overall cashflows as well as detailed inflow and outflow 
    forecasts — generate exactly **four (4)** strategic recommendations. These will be presented to 
    decision-makers through a hybrid Decision Support System. Your recommendations must be **data-driven**, 
    **concise**, and **actionable** within the operational realities of businesses in the Philippines.

    Each recommendation must include:
    - A **id** that will always be unique. This will serves as an ID of each recommendation for easier frontend configurations. This field will always start from 1 for the first object in the array and 4 for the last object in the array.
    - An **impact level**: One of "HIGH IMPACT", "MEDIUM IMPACT", or "LOW IMPACT"
    - A **short, actionable recommendation title**
    - A **recommendation detail** (maximum of two sentences), grounded in the forecast data

    ### Example Output Format (strictly JSON):
    {
      { "id": 1
        "recommendationTitle": Negotiate Lower Operating Costs,
        "detail": Identify areas where operating expenses can be reduced, such as renegotiating supplier contracts or streamlining processes. This will improve profitability and free up cash.,
        "impactLevel": HIGH IMPACT
      }
    }

    Here is the cashflow forecast data:
    ${JSON.stringify(cashflowForecast, null, 2)}

    Here is the inflow/outflow forecast data:
    ${JSON.stringify(inflowOutflowForecast, null, 2)}

    

    Respond ONLY with the valid JSON object:
    {
      "insights": [
        { "id": 1,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 2,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 3,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 4,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        }
      ]
    }
    `;
  // Call Gemini
  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  // Parse and return the insights
  const insights = JSON.parse(cleanedText);
  console.log("Parsed Gemini insights:", insights);


const insightsArr = Array.isArray(insights.insights) ? insights.insights : [];

return {
  success: true,
  insights: insightsArr.map(r => ({
    id: r.id,
    recommendationTitle: r.recommendationTitle,
    detail: r.detail,
    impactLevel: r.impactLevel,
  })),
};

  } 
  catch (err) {
    let errorMsg = "Internal server error";
    if (err instanceof SyntaxError) {
      errorMsg = "Failed to parse Gemini response";
    } else if (err.message && err.message.includes("Unauthorized")) {
      errorMsg = "Unauthorized";
    } else if (err.message && err.message.includes("User not found")) {
      errorMsg = "User not found";
    }
    // Optionally log the error for debugging
    console.error("getOverallFinancialDataAnalysis error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function getAllInflows() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Fetch all inflow transactions for the user
  const inflows = await db.Transaction.findMany({
    where: { 
      // userId: user.id,
      type: "INCOME" 
    },
    select: { 
      category: true,
      amount: true, 
      accountId: true,
      type: true,
      date: true,
      account: {
        select: {
          name: true
        }
      },
    },
    orderBy: { date: "asc" },
  });
  console.log("getAllInflows", inflows[0], inflows[1])
  const inflowsSerialize = inflows.map(inflow => ({
    ...inflow,
    amount: Number(inflow.amount),
  }))

  return inflowsSerialize;
}

export async function getAllOutflows() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role !== "ADMIN") {
  throw new Error("Unauthorized");
  }

  // Fetch all outflow transactions for the user
  const outflows = await db.Transaction.findMany({
    where: { 
      userId: user.id,
      type: "EXPENSE" 
    },
    select: { 
      category: true,
      amount: true, 
      accountId: true,
      account: {
        select: {
          name: true
        }
      },
    },
    orderBy: { date: "asc" },
  });

  const outflowsSerialize = outflows.map(outflow => ({
    ...outflow,
    amount: Number(outflow.amount),
  }))

  return outflowsSerialize;
 
}

export async function getAllTransactions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }  
  
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }


  const transactions = await db.Transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { 
      amount: true,
      category: true,
      createdAt: true,
    },
  });

  const transactionSerialize = transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return transactionSerialize;
}



// export async function getDSSincomesData() {
//     const {userId} = await auth();
//     if (!userId) throw new Error ("Unauthorized");

//     const user = await db.user.findUnique({
//         where: {clerkUserId: userId},
//     });

//     if (!user) {
//         throw new Error ("User not found.");
//     }

//     // Get all user transactions
//     const transactions = await db.transaction.findMany({
//         where: {type: "INCOME"},
//         orderBy: {date: "desc"},
//     });
//     console.log("getDSSincomesData", transactions[0], transactions[1])


//     return transactions.map(serializeTransaction);
// }