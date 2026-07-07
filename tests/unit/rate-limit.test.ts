import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    expect(rateLimit("k", 3, 1000, 0).allowed).toBe(true);
    expect(rateLimit("k", 3, 1000, 10).allowed).toBe(true);
    expect(rateLimit("k", 3, 1000, 20).allowed).toBe(true);
  });

  it("blocks requests over the limit and reports retryAfter", () => {
    rateLimit("k", 2, 1000, 0);
    rateLimit("k", 2, 1000, 10);
    const third = rateLimit("k", 2, 1000, 500);
    expect(third.allowed).toBe(false);
    expect(third.retryAfter).toBe(1); // 500ms left → ceil to 1s
  });

  it("resets after the window elapses", () => {
    rateLimit("k", 1, 1000, 0);
    expect(rateLimit("k", 1, 1000, 999).allowed).toBe(false);
    expect(rateLimit("k", 1, 1000, 1000).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    rateLimit("company-a", 1, 1000, 0);
    expect(rateLimit("company-a", 1, 1000, 1).allowed).toBe(false);
    expect(rateLimit("company-b", 1, 1000, 1).allowed).toBe(true);
  });

  it("counts remaining correctly", () => {
    expect(rateLimit("k", 3, 1000, 0).remaining).toBe(2);
    expect(rateLimit("k", 3, 1000, 1).remaining).toBe(1);
    expect(rateLimit("k", 3, 1000, 2).remaining).toBe(0);
  });
});
