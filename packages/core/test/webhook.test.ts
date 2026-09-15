import { describe, it, expect, vi } from "vitest";
import { createHash } from "node:crypto";
import { handleWebhook } from "../src/webhook";

const serverKey = "SB-Mid-server-abcdef123456";
const payload = {
  transaction_id: "tx-1",
  transaction_time: "2026-09-15 10:00:00",
  transaction_status: "settlement",
  order_id: "ORDER-123",
  status_code: "200",
  status_message: "Success",
  signature_key: "",
  payment_type: "bank_transfer",
  gross_amount: "10000.00",
  currency: "IDR",
  merchant_id: "M-1",
  va_numbers: [{ bank: "bca", va_number: "99999" }],
};

function makeRequest(body: unknown, signature: string) {
  const request = new Request("http://localhost/api/midtrans/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature-key": signature },
    body: JSON.stringify(body),
  });
  return request;
}

function makeSignature(statusCode: string, grossAmount: string) {
  return createHash("sha512")
    .update("ORDER-123" + statusCode + grossAmount + serverKey)
    .digest("hex");
}

describe("handleWebhook", () => {
  it("calls handler with typed notification on valid signature", async () => {
    const handler = vi.fn();
    const signature = makeSignature(payload.status_code, payload.gross_amount);

    const res = await handleWebhook({ serverKey, handler }, makeRequest(payload, signature));

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
    const notif = handler.mock.calls[0][0];
    expect(notif.order_id).toBe("ORDER-123");
    expect(notif.transaction_status).toBe("settlement");
    expect(notif.va_numbers).toEqual([{ bank: "bca", va_number: "99999" }]);
  });

  it("rejects invalid signature with 401 and does not call handler", async () => {
    const handler = vi.fn();
    const res = await handleWebhook(
      { serverKey, handler },
      makeRequest(payload, "tampered-signature")
    );

    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects when gross_amount differs from signature", async () => {
    const handler = vi.fn();
    const tamperedPayload = { ...payload, gross_amount: "99999.00" };
    const res = await handleWebhook(
      { serverKey, handler },
      makeRequest(tamperedPayload, makeSignature("200", "10000.00"))
    );

    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("propagates handler errors as 500", async () => {
    const handler = vi.fn().mockImplementation(() => {
      throw new Error("db down");
    });
    const signature = makeSignature(payload.status_code, payload.gross_amount);

    const res = await handleWebhook({ serverKey, handler }, makeRequest(payload, signature));

    expect(res.status).toBe(500);
  });
});