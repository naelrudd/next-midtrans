import type { NextRequest } from "next/server";
import { handleWebhook } from "@next-midtrans/core";
import type { TransactionNotification } from "@next-midtrans/core";

export async function POST(request: NextRequest) {
  return handleWebhook(
    {
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      async handler(notification: TransactionNotification) {
        console.log(`Order ${notification.order_id} -> ${notification.transaction_status}`);

        if (notification.transaction_status === "settlement") {
          // mark paid in DB
        } else if (notification.transaction_status === "pending") {
          // mark pending
        } else if (notification.transaction_status === "deny") {
          // mark failed
        }
      },
    },
    request
  );
}