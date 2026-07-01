import { z } from "zod";

export const binNumberSchema = z
  .string()
  .min(1, "BIN is required")
  .regex(/^\d{12}$|^\d{9}-\d{4}$/, "BIN must be 12 digits or 000123456-0101 format");

export function normalizeBin(bin: string): string {
  return bin.replace(/-/g, "");
}

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
