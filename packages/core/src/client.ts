import { createHttpClient } from "./http";
import { createSnapModule } from "./snap";
import { createTransactionsModule } from "./transactions";

export interface MidtransOptions {
  serverKey: string;
  isProduction?: boolean;
  timeoutMs?: number;
}

export function createMidtrans(options: MidtransOptions) {
  const http = createHttpClient(options);
  return {
    snap: createSnapModule(http),
    transactions: createTransactionsModule(http),
  };
}

export type Midtrans = ReturnType<typeof createMidtrans>;