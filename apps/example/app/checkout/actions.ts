"use server";

import { createMidtrans } from "@next-midtrans/core";

const serverKey = process.env.MIDTRANS_SERVER_KEY!;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export async function createSnapToken(orderId: string, grossAmount: number) {
  const midtrans = createMidtrans({ serverKey, isProduction });

  const result = await midtrans.snap.createTransaction({
    transactionDetails: { orderId, grossAmount },
    itemDetails: [
      {
        id: "ITEM-1",
        price: grossAmount,
        quantity: 1,
        name: "Next Midtrans sticker pack",
      },
    ],
    customerDetails: {
      firstName: "Nael",
      email: "nael@example.com",
    },
    expiry: { startTime: new Date().toISOString(), unit: "minutes", duration: 10 },
  });

  return result.token;
}