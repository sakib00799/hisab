import { z } from "zod";

export const upgradeSubscriptionSchema = z.object({
  plan: z.enum(["BUSINESS", "PRO", "ACCOUNTANT_PACK"]),
});

export const fileVatPeriodSchema = z.object({
  challanRef: z.string().optional(),
});

export const ocrRequestSchema = z.object({
  imageUrl: z.string().url(),
  imageHash: z.string().optional(),
});

export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
