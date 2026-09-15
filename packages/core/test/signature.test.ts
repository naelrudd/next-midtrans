import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { verifySignature } from "./src/signature";

const serverKey = "SB-Mid-server-abcdef123456";
const orderId = "ORDER-123";
const statusCode = "200";
const grossAmount = "10000.00";

function makeSignature() {
  return createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
}

describe("verifySignature", () => {
  it("accepts a valid signature", () => {
    const verify = verifySignature({ orderId, statusCode, grossAmount, serverKey });
    expect(verify(makeSignature())).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const verify = verifySignature({ orderId, statusCode, grossAmount, serverKey });
    expect(verify("deadbeef")).toBe(false);
  });

  it("rejects when grossAmount is tampered", () => {
    const verify = verifySignature({
      orderId: "ORDER-999",
      statusCode,
      grossAmount,
      serverKey,
    });
    expect(verify(makeSignature())).toBe(false);
  });

  it("rejects empty signature", () => {
    const verify = verifySignature({ orderId, statusCode, grossAmount, serverKey });
    expect(verify("")).toBe(false);
  });
});