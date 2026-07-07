import { describe, expect, it } from "vitest";
import { categorizeTransaction } from "@/lib/bank/categorize";

describe("categorizeTransaction", () => {
  it("detects mobile banking providers", () => {
    expect(categorizeTransaction("bKash payment to 017XXXXXXXX")).toBe("Mobile Banking");
    expect(categorizeTransaction("NAGAD cashout")).toBe("Mobile Banking");
  });

  it("categorizes rent (first matching rule wins)", () => {
    expect(categorizeTransaction("Monthly office rent")).toBe("RENT");
  });

  it("categorizes utilities", () => {
    expect(categorizeTransaction("DESCO bill June")).toBe("UTILITIES");
    expect(categorizeTransaction("Titas gas payment")).toBe("UTILITIES");
  });

  it("categorizes transport", () => {
    expect(categorizeTransaction("Uber trip")).toBe("TRANSPORT");
    expect(categorizeTransaction("Pathao delivery charge")).toBe("TRANSPORT");
  });

  it("categorizes salaries and bank charges", () => {
    expect(categorizeTransaction("Staff salary June")).toBe("SALARIES");
    expect(categorizeTransaction("SMS charge")).toBe("BANK_CHARGES");
  });

  it("categorizes marketing", () => {
    expect(categorizeTransaction("Facebook ads billing")).toBe("MARKETING");
  });

  it("is case-insensitive", () => {
    expect(categorizeTransaction("BKASH TRANSFER")).toBe("Mobile Banking");
  });

  it("returns null for unknown descriptions", () => {
    expect(categorizeTransaction("Miscellaneous payment")).toBeNull();
  });
});
