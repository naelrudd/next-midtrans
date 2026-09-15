<p align="center">
  <img src="https://img.shields.io/npm/v/next-midtrans" alt="npm version" />
  <img src="https://img.shields.io/npm/dt/next-midtrans" alt="npm downloads" />
  <img src="https://img.shields.io/github/stars/naelrudd/next-midtrans" alt="GitHub stars" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

# 💳 next-midtrans

**Typed Midtrans integration for Next.js App Router.**

No more hand-rolled `fetch` calls and `any`-typed webhook payloads. `next-midtrans` gives you:

- ✅ **Fully typed** Snap, Core API, and webhook notification — autocomplete everywhere
- ✅ **`handleWebhook`** — one-line signature verification (SHA-512) + typed callback
- ✅ **App Router native** — works in Server Actions, Route Handlers, and API routes
- ✅ **Sandbox/production toggle** — zero config swap via one boolean
- ✅ **Lightweight** — zero runtime dependencies, tree-shakeable, ESM-only

## 🚀 Why this exists

Midtrans is the dominant payment gateway in Indonesia, but its SDK is unmaintained, untyped, and built for the old Pages Router era. Every Next.js dev in Indonesia ends up copy-pasting the same buggy webhook verification and `any`-typed JSON parsing.

This library kills that boilerplate.

## 📦 Install

```bash
npm install next-midtrans
```

## 🔑 Setup

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXX
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXX
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

## 🧾 Create a Snap transaction (Server Action)

```ts
"use server";

import { createMidtrans } from "next-midtrans";

const midtrans = createMidtrans({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  isProduction: process.env.NODE_ENV === "production",
});

export async function createSnapToken(orderId: string, grossAmount: number) {
  const { token, redirect_url } = await midtrans.snap.createTransaction({
    transactionDetails: { orderId, grossAmount },
    itemDetails: [{ id: "ITEM-1", price: grossAmount, quantity: 1, name: "Merch" }],
    customerDetails: { firstName: "Nael", email: "nael@example.com" },
    expiry: { startTime: new Date().toISOString(), unit: "minutes", duration: 10 },
  });
  return token;
}
```

## ⚡ Pay on the client

```tsx
"use client";

import { useSnap } from "next-midtrans/react";

export function Checkout({ orderId }: { orderId: string }) {
  const { pay, snap, loading, error } = useSnap(
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
  );

  async function handlePay() {
    const token = await createSnapToken(orderId, 10000);
    pay(token, {
      onSuccess: (result) => console.log("paid", result.transaction_status),
      onPending: (result) => console.log("pending", result),
      onError: (result) => console.log("failed", result),
      onClose: () => console.log("closed"),
    });
  }

  return <button onClick={handlePay}>Pay</button>;
}
```

## 🔔 Handle webhooks (typed)

```ts
// app/api/midtrans/webhook/route.ts
import type { NextRequest } from "next/server";
import { handleWebhook } from "next-midtrans";

export async function POST(request: NextRequest) {
  return handleWebhook(
    {
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      async handler(notification) {
        // notification.order_id, notification.transaction_status...
        if (notification.transaction_status === "settlement") {
          await markOrderPaid(notification.order_id);
        }
      },
    },
    request
  );
}
```

**`handleWebhook` automatically:**
1. Parses the notification payload
2. Verifies the `x-signature-key` (SHA-512 of `orderId + statusCode + grossAmount + serverKey`)
3. Returns `401` on bad signature, `200` on success
4. Passes you a **typed** `TransactionNotification`

Need it manually? Raw verify is exported too:

```ts
import { verifySignature } from "next-midtrans";

const isValid = verifySignature({
  orderId, statusCode, grossAmount, serverKey,
})("received-signature-header");
```

## 💸 Core API (charge, status, refund, cancel)

```ts
const midtrans = createMidtrans({ serverKey, isProduction });
const params = { orderId, grossAmount };

// Direct charge (VA e.g.)
const charge = await midtrans.transactions.charge({
  paymentType: "bank_transfer",
  transactionDetails: params,
  bankTransfer: { bank: "bca", vaNumber: "99999", freeText: [{ en: "thanks" }] },
});
// charge.va_numbers?.[0]?.va_number

// Query / mutate
const status  = await midtrans.transactions.status(orderId);
const cancel  = await midtrans.transactions.cancel(orderId);
const refund  = await midtrans.transactions.refund(orderId, { refundKey: "r1", amount: 10000, reason: "no refunds, actually" });
```

## 🧰 All API surface

| Area | Method |
|------|--------|
| Snap | `createTransaction` |
| Charge | `credit_card`, `bank_transfer`, `echannel`, `qris`, `gopay`, `cstore` |
| Manage | `status`, `statusById`, `cancel`, `expire`, `approve`, `deny`, `refund` |
| Webhook | `handleWebhook`, `verifySignature` |
| Client | `useSnap` hook (popup) + `embed` (inline) |

## 🔒 Security notes

- `serverKey` never leaves the server — server actions & route handlers only
- Signature comparison uses `timingSafeEqual`, not string `===`
- Client key is safe to expose (it's how Snap.js identifies your merchant), but `NEXT_PUBLIC_` prefix means it's bundled client-side intentionally

## 🧑‍💻 Local example

```bash
npm install
cp apps/example/.env.example apps/example/.env.local  # fill in sandbox keys from https://dashboard.sandbox.midtrans.com
npm run dev:example
# → http://localhost:3000/checkout
```

## 📄 License

MIT © [naelrudd](https://github.com/naelrudd)