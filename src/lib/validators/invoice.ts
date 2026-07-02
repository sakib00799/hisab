import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  quantity: z.coerce
    .number({ error: "Quantity is required" })
    .positive("Quantity must be positive"),
  unitPrice: z.coerce
    .number({ error: "Unit price is required" })
    .min(0, "Unit price must be non-negative"),
  vatRate: z.coerce
    .number({ error: "VAT rate is required" })
    .min(0)
    .max(100),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
