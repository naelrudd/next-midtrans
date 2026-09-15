import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TransactionNotification } from "./types";
import { verifySignature } from "./signature";
import { MidtransClientError } from "./http";

export type WebhookHandler = (
  notification: TransactionNotification
) => Promise<void> | void;

export interface WebhookConfig {
  serverKey: string;
  handler: WebhookHandler;
}

export function handleWebhook(
  config: WebhookConfig,
  req: Request | NextRequest
): Promise<NextResponse> {
  return handleWebhookInternal(config, req);
}

async function handleWebhookInternal(
  config: WebhookConfig,
  req: Request | NextRequest
): Promise<NextResponse> {
  try {
    const body = (await req.json()) as TransactionNotification;

    const signatureHeader = req.headers.get("x-signature-key") ?? req.headers.get("signature-key") ?? "";

    const verify = verifySignature({
      orderId: body.order_id,
      statusCode: body.status_code,
      grossAmount: body.gross_amount,
      serverKey: config.serverKey,
    });

    if (!verify(signatureHeader)) {
      return NextResponse.json(
        { status_message: "Invalid signature", status_code: "401" },
        { status: 401 }
      );
    }

    await config.handler(body);

    return NextResponse.json({ status_message: "OK", status_code: "200" }, { status: 200 });
  } catch (error) {
    if (error instanceof MidtransClientError) {
      return NextResponse.json(error.body, { status: Number(error.status) });
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { status_message: error.message, status_code: "500" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status_message: "Internal server error", status_code: "500" },
      { status: 500 }
    );
  }
}