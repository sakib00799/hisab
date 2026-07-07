import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateSslHash } from "@/lib/services/subscription.service";

const STORE_PASS = "test-store-pass";

function signedPayload(fields: Record<string, string>): Record<string, string> {
  const keys = Object.keys(fields);
  const verifyKey = keys.join(",");
  let hashString = "";
  for (const key of keys) {
    hashString += `${key}=${fields[key]}&`;
  }
  hashString += `store_passwd=${STORE_PASS}`;
  const verifySign = crypto.createHash("md5").update(hashString).digest("hex");
  return { ...fields, verify_key: verifyKey, verify_sign: verifySign };
}

describe("validateSslHash (SSLCommerz webhook)", () => {
  const originalPass = process.env.SSLCOMMERZ_STORE_PASS;

  beforeEach(() => {
    process.env.SSLCOMMERZ_STORE_PASS = STORE_PASS;
  });

  afterEach(() => {
    process.env.SSLCOMMERZ_STORE_PASS = originalPass;
  });

  it("accepts a correctly signed payload", () => {
    const payload = signedPayload({
      tran_id: "HISAB-c1-123",
      status: "VALID",
      amount: "2499.00",
    });
    expect(validateSslHash(payload)).toBe(true);
  });

  it("rejects a payload with a tampered field", () => {
    const payload = signedPayload({
      tran_id: "HISAB-c1-123",
      status: "VALID",
      amount: "2499.00",
    });
    payload.amount = "1.00";
    expect(validateSslHash(payload)).toBe(false);
  });

  it("rejects a payload with a forged signature", () => {
    const payload = signedPayload({ tran_id: "t", status: "VALID" });
    payload.verify_sign = "0".repeat(32);
    expect(validateSslHash(payload)).toBe(false);
  });

  it("rejects a payload missing verify_key", () => {
    expect(validateSslHash({ status: "VALID" })).toBe(false);
  });

  it("rejects everything when the store password is not configured", () => {
    delete process.env.SSLCOMMERZ_STORE_PASS;
    const payload = signedPayload({ status: "VALID" });
    expect(validateSslHash(payload)).toBe(false);
  });
});
