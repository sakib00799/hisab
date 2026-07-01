export type InvoiceStatus = "paid" | "pending" | "overdue" | "due_soon";

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  vat: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export const mockKpis = {
  totalRevenue: 2847500,
  revenueChange: 12.4,
  outstandingInvoices: 485000,
  outstandingCount: 7,
  vatOwed: 128400,
  vatDueDate: "2026-06-25",
  expensesThisMonth: 312000,
  expensesChange: -3.2,
};

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2026-042",
    customer: "Rahim Traders Ltd.",
    amount: 125000,
    vat: 18750,
    status: "paid",
    issueDate: "2026-06-01",
    dueDate: "2026-06-15",
  },
  {
    id: "2",
    number: "INV-2026-041",
    customer: "Karim & Sons",
    amount: 85000,
    vat: 12750,
    status: "due_soon",
    issueDate: "2026-06-05",
    dueDate: "2026-06-20",
  },
  {
    id: "3",
    number: "INV-2026-040",
    customer: "Dhaka Steel Works",
    amount: 210000,
    vat: 31500,
    status: "pending",
    issueDate: "2026-06-08",
    dueDate: "2026-07-08",
  },
  {
    id: "4",
    number: "INV-2026-039",
    customer: "Bashundhara Trading",
    amount: 65000,
    vat: 9750,
    status: "overdue",
    issueDate: "2026-05-10",
    dueDate: "2026-05-25",
  },
  {
    id: "5",
    number: "INV-2026-038",
    customer: "Green Valley Foods",
    amount: 42000,
    vat: 6300,
    status: "paid",
    issueDate: "2026-05-28",
    dueDate: "2026-06-12",
  },
  {
    id: "6",
    number: "INV-2026-037",
    customer: "Metro Logistics",
    amount: 98000,
    vat: 14700,
    status: "pending",
    issueDate: "2026-06-10",
    dueDate: "2026-07-10",
  },
];

export const mockVatSummary = {
  period: "May 2026",
  outputVat: 428400,
  inputVat: 300000,
  netVatPayable: 128400,
  filingDeadline: "2026-06-25",
  status: "due_soon" as const,
  monthlyBreakdown: [
    { month: "Jan", output: 320000, input: 210000 },
    { month: "Feb", output: 285000, input: 195000 },
    { month: "Mar", output: 350000, input: 240000 },
    { month: "Apr", output: 390000, input: 270000 },
    { month: "May", output: 428400, input: 300000 },
    { month: "Jun", output: 180000, input: 120000 },
  ],
};
