export interface ParsedTransaction {
  transactionDate: Date;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
}

type ColumnMap = {
  date: string;
  description: string;
  debit?: string;
  credit?: string;
  amount?: string;
  dateFormat?: "iso" | "dmy";
};

const BANK_PARSERS: Record<string, ColumnMap> = {
  brac: {
    date: "Date",
    description: "Description",
    debit: "Debit",
    credit: "Credit",
    dateFormat: "dmy",
  },
  dbbl: {
    date: "Transaction Date",
    description: "Particulars",
    debit: "Withdrawal",
    credit: "Deposit",
    dateFormat: "dmy",
  },
  islami: {
    date: "Date",
    description: "Description",
    amount: "Amount",
    dateFormat: "dmy",
  },
  ebl: {
    date: "Value Date",
    description: "Transaction Details",
    debit: "Debit Amount",
    credit: "Credit Amount",
    dateFormat: "dmy",
  },
  generic: {
    date: "date",
    description: "description",
    debit: "debit",
    credit: "credit",
    amount: "amount",
    dateFormat: "iso",
  },
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(value: string, format: "iso" | "dmy" = "dmy"): Date {
  const cleaned = value.trim();
  if (format === "iso") {
    return new Date(cleaned);
  }
  const parts = cleaned.split(/[/-]/);
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    const year = y < 100 ? 2000 + y : y;
    return new Date(year, m - 1, d);
  }
  return new Date(cleaned);
}

function findColumnIndex(headers: string[], name: string): number {
  const lower = name.toLowerCase();
  return headers.findIndex((h) => h.toLowerCase().includes(lower));
}

function detectBank(headers: string[]): ColumnMap {
  const headerStr = headers.join(" ").toLowerCase();
  if (headerStr.includes("withdrawal") && headerStr.includes("deposit")) {
    return BANK_PARSERS.dbbl;
  }
  if (headerStr.includes("debit amount") && headerStr.includes("credit amount")) {
    return BANK_PARSERS.ebl;
  }
  if (headerStr.includes("particulars")) {
    return BANK_PARSERS.dbbl;
  }
  return BANK_PARSERS.generic;
}

export function parseBankCsv(
  csvContent: string,
  bankHint?: string
): ParsedTransaction[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.replace(/^"|"$/g, "").trim()
  );

  const map =
    bankHint && BANK_PARSERS[bankHint]
      ? BANK_PARSERS[bankHint]
      : detectBank(headers);

  const dateIdx = findColumnIndex(headers, map.date);
  const descIdx = findColumnIndex(headers, map.description);
  const debitIdx = map.debit ? findColumnIndex(headers, map.debit) : -1;
  const creditIdx = map.credit ? findColumnIndex(headers, map.credit) : -1;
  const amountIdx = map.amount ? findColumnIndex(headers, map.amount) : -1;

  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 2) continue;

    const dateStr = dateIdx >= 0 ? cols[dateIdx] : cols[0];
    const description = descIdx >= 0 ? cols[descIdx] : cols[1];

    if (!dateStr || !description) continue;

    let amount = 0;
    let type: "CREDIT" | "DEBIT" = "DEBIT";

    if (debitIdx >= 0 && cols[debitIdx] && parseFloat(cols[debitIdx]) > 0) {
      amount = Math.abs(parseFloat(cols[debitIdx].replace(/,/g, "")));
      type = "DEBIT";
    } else if (creditIdx >= 0 && cols[creditIdx] && parseFloat(cols[creditIdx]) > 0) {
      amount = Math.abs(parseFloat(cols[creditIdx].replace(/,/g, "")));
      type = "CREDIT";
    } else if (amountIdx >= 0 && cols[amountIdx]) {
      const raw = parseFloat(cols[amountIdx].replace(/,/g, ""));
      amount = Math.abs(raw);
      type = raw >= 0 ? "CREDIT" : "DEBIT";
    } else {
      continue;
    }

    if (amount === 0 || isNaN(amount)) continue;

    transactions.push({
      transactionDate: parseDate(dateStr, map.dateFormat),
      description,
      amount,
      type,
    });
  }

  return transactions;
}
