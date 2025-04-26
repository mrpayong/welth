import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(1, "Company name is required."),
    type: z.enum([
        "FREELANCE", //isIndiv
        "PROFESSIONAL", //isIndiv
        "SOLEPROPRIETORSHIP", //isIndiv

        "INCORPORATION",
        "PARTNERSHIP",
        "COOPERATIVE",
        "ASSOCIATION",
        "CORPORATION",

        "OTHERS"
    ],{ required_error: "Please select a business type." }),
    isIndividual: z.boolean({required_error: "isActive is required"}).default(false),

    
    street: z.string().min(1, "Street is required."),
    town: z.string().min(1, "Town is required."),
    city: z.string().min(1, "City is required."),
    zip: z.string().min(1, "Zip code is required."),
    province: z.string().min(1, "Province is required."),
    region: z.string().min(1, "Region is required."), 

    businessLine: z.string().min(1, "Line of business is required."),
    tin: z.array(z.coerce.number().int().min(1, "TIN segments must be positive integers"))
    .length(4, "TIN must have exactly 4 segments (3-3-3-5 digits)."),

    RDO: z.string().min(1, "RDO code is required."),
    birthDate: z.coerce.date({required_error: "Date is required"}),
    contactNumber: z.coerce.string() // Ensures it's an integer
    .refine((value) => value.toString().length === 11, "Fill in the contact number corretly."),

    email: z.string().min(1, "Email is required."),
    isHeadOffice: z.boolean().default(false),
    branchCount: z.coerce.number().optional(),
    owner: z.string().min(1, "Name of owner is required."),
})

export const subAccountSchema = z.object({
    name: z.string().min(1, "Sub-account name is required."),
    description: z.string().optional(),
    accountId: z.string().min(1, "Account is required"),
    // balance: z.string().optional().nullable(),
    parentName: z.string().optional(), // Validate parent name
  });

export const transactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    Activity: z.enum(["OPERATION", "INVESTMENT", "FINANCING"]),
    amount: z.string().min(1, "Amount is required"),
    refNumber: z.string().min(1, "Reference number is required"),
    description: z.string().optional(),
    particular: z.string().optional(),
    date: z.date({required_error: "Date is required"}),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY","WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
    if(data.isRecurring && !data.recurringInterval){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"],
        });
    }
});