import { z } from "zod";

export const expenseCategories = [
  "COST_OF_GOODS",
  "RENT",
  "UTILITIES",
  "TRANSPORT",
  "MARKETING",
  "SALARIES",
  "BANK_CHARGES",
  "PROFESSIONAL_FEES",
  "OFFICE_SUPPLIES",
  "OTHER",
] as const;

export const createExpenseSchema = z.object({
  supplierId: z.string().optional(),
  category: z.enum(expenseCategories),
  description: z.string().optional(),
  amount: z.number().min(0),
  vatAmount: z.number().min(0).default(0),
  expenseDate: z.string().min(1),
  receiptUrl: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  binNumber: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
