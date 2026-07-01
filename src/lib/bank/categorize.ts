const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["bkash", "nagad", "rocket", "upay"], category: "Mobile Banking" },
  { keywords: ["rent", "lease"], category: "RENT" },
  { keywords: ["electric", "gas", "water", "utility", "desco", "dpdc"], category: "UTILITIES" },
  { keywords: ["fuel", "cng", "transport", "uber", "pathao"], category: "TRANSPORT" },
  { keywords: ["salary", "payroll", "wages"], category: "SALARIES" },
  { keywords: ["bank charge", "service charge", "sms charge"], category: "BANK_CHARGES" },
  { keywords: ["facebook", "google ads", "marketing"], category: "MARKETING" },
  { keywords: ["office", "stationery", "supplies"], category: "OFFICE_SUPPLIES" },
];

export function categorizeTransaction(description: string): string | null {
  const lower = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return null;
}
