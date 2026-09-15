import { createHash, timingSafeEqual } from "node:crypto";
import type { WebhookVerificationInput } from "./types";

export function verifySignature({
  orderId,
  statusCode,
  grossAmount,
  serverKey,
}: WebhookVerificationInput) {
  const expected = createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  return (signature: string) => {
    const received = Buffer.from(signature);
    const wanted = Buffer.from(expected);
    if (received.length !== wanted.length) return false;
    return timingSafeEqual(received, wanted);
  };
}