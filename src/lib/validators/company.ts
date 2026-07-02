import { z } from "zod";

export function normalizeBin(bin: string): string {
  return bin.replace(/[\s-]/g, "");
}

export const binNumberSchema = z
  .string()
  .min(1, "BIN is required")
  .transform(normalizeBin)
  .refine((value) => /^\d{12}$/.test(value), {
    message: "BIN must be exactly 12 digits (e.g. 000123456789)",
  });

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  binNumber: binNumberSchema,
  tinNumber: z.string().optional(),
  vatType: z
    .enum(["STANDARD", "ZERO_RATED", "EXEMPT", "TRUNCATED"])
    .default("STANDARD"),
  businessCategory: z.string().optional(),
  address: z.string().optional(),
  fiscalYearStart: z.number().int().min(1).max(12).default(7),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial().omit({
  bankName: true,
  accountNumber: true,
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
