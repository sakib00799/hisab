import { describe, expect, it } from "vitest";
import { parseBankCsv } from "@/lib/bank/parsers";

const BRAC_CSV = `Date,Description,Debit,Credit,Balance
01/06/2026,Opening balance,,,"50,000.00"
02/06/2026,bKash transfer to supplier,"12,500.00",,37500.00
15/06/2026,Customer payment INV-0012,,"25,000.00",62500.00`;

const DBBL_CSV = `Transaction Date,Particulars,Withdrawal,Deposit,Balance
03-06-2026,Office rent June,15000.00,,85000.00
10-06-2026,Cash deposit,,40000.00,125000.00`;

const EBL_CSV = `Value Date,Transaction Details,Debit Amount,Credit Amount
05/06/2026,DESCO electric bill,3200.00,
20/06/2026,Client payment received,,18000.00`;

const ISLAMI_CSV = `Date,Description,Amount
07/06/2026,Salary payment,-30000
25/06/2026,Sales deposit,45000`;

const GENERIC_CSV = `date,description,amount
2026-06-01,Stripe payout,1200.50
2026-06-02,Refund issued,-300`;

describe("parseBankCsv — BRAC format", () => {
  it("parses debits and credits with comma-separated amounts", () => {
    const txns = parseBankCsv(BRAC_CSV, "brac");
    expect(txns).toHaveLength(2); // opening balance row has no amount → skipped

    expect(txns[0].type).toBe("DEBIT");
    expect(txns[0].amount).toBe(12500);
    expect(txns[0].description).toContain("bKash");

    expect(txns[1].type).toBe("CREDIT");
    expect(txns[1].amount).toBe(25000);
  });

  it("parses D/M/Y dates", () => {
    const txns = parseBankCsv(BRAC_CSV, "brac");
    expect(txns[0].transactionDate.getFullYear()).toBe(2026);
    expect(txns[0].transactionDate.getMonth()).toBe(5); // June
    expect(txns[0].transactionDate.getDate()).toBe(2);
  });
});

describe("parseBankCsv — DBBL format", () => {
  it("maps Withdrawal/Deposit columns and detects the bank from headers", () => {
    // No hint: detected via "withdrawal" + "deposit" headers.
    const txns = parseBankCsv(DBBL_CSV);
    expect(txns).toHaveLength(2);
    expect(txns[0].type).toBe("DEBIT");
    expect(txns[0].amount).toBe(15000);
    expect(txns[1].type).toBe("CREDIT");
    expect(txns[1].amount).toBe(40000);
  });

  it("parses dash-separated dates", () => {
    const txns = parseBankCsv(DBBL_CSV);
    expect(txns[0].transactionDate.getDate()).toBe(3);
    expect(txns[0].transactionDate.getMonth()).toBe(5);
  });
});

describe("parseBankCsv — EBL format", () => {
  it("detects EBL via Debit Amount/Credit Amount headers", () => {
    const txns = parseBankCsv(EBL_CSV);
    expect(txns).toHaveLength(2);
    expect(txns[0].type).toBe("DEBIT");
    expect(txns[0].amount).toBe(3200);
    expect(txns[1].type).toBe("CREDIT");
    expect(txns[1].amount).toBe(18000);
  });
});

describe("parseBankCsv — Islami single-amount format", () => {
  it("uses sign to determine debit vs credit", () => {
    const txns = parseBankCsv(ISLAMI_CSV, "islami");
    expect(txns).toHaveLength(2);
    expect(txns[0].type).toBe("DEBIT");
    expect(txns[0].amount).toBe(30000);
    expect(txns[1].type).toBe("CREDIT");
    expect(txns[1].amount).toBe(45000);
  });
});

describe("parseBankCsv — generic format", () => {
  it("parses ISO dates and signed amounts", () => {
    const txns = parseBankCsv(GENERIC_CSV);
    expect(txns).toHaveLength(2);
    expect(txns[0].type).toBe("CREDIT");
    expect(txns[0].amount).toBe(1200.5);
    expect(txns[1].type).toBe("DEBIT");
    expect(txns[1].amount).toBe(300);
  });
});

describe("parseBankCsv — edge cases", () => {
  it("returns empty for an empty file", () => {
    expect(parseBankCsv("")).toEqual([]);
  });

  it("returns empty for a header-only file", () => {
    expect(parseBankCsv("Date,Description,Debit,Credit")).toEqual([]);
  });

  it("skips rows with no parsable amount", () => {
    const csv = `Date,Description,Debit,Credit
01/06/2026,No amounts here,,`;
    expect(parseBankCsv(csv, "brac")).toEqual([]);
  });

  it("handles quoted descriptions containing commas", () => {
    const csv = `Date,Description,Debit,Credit
01/06/2026,"Rent, June 2026",5000,`;
    const txns = parseBankCsv(csv, "brac");
    expect(txns).toHaveLength(1);
    expect(txns[0].description).toBe("Rent, June 2026");
  });

  it("expands 2-digit years to 20xx", () => {
    const csv = `Date,Description,Debit,Credit
01/06/26,Two-digit year,100,`;
    const txns = parseBankCsv(csv, "brac");
    expect(txns[0].transactionDate.getFullYear()).toBe(2026);
  });
});
