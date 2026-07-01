import { z } from "zod";

export const createBankAccountSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountType: z.string().optional(),
});

export const matchTransactionSchema = z.object({
  invoiceId: z.string().optional(),
  expenseId: z.string().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
