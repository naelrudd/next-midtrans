import type {
  ChargeRequest,
  ChargeResponse,
  TransactionStatusResponse,
  RefundRequest,
  RefundResponse,
} from "./types";
import type { createHttpClient } from "./http";

export interface TransactionsModule {
  charge(request: ChargeRequest): Promise<ChargeResponse>;
  status(orderId: string): Promise<TransactionStatusResponse>;
  cancel(orderId: string): Promise<TransactionStatusResponse>;
  expire(orderId: string): Promise<TransactionStatusResponse>;
  approve(orderId: string): Promise<TransactionStatusResponse>;
  deny(orderId: string): Promise<TransactionStatusResponse>;
  refund(orderId: string, request: RefundRequest): Promise<RefundResponse>;
  statusById(transactionId: string): Promise<TransactionStatusResponse>;
}

function toSnake<T extends object>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const snakeKey = key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[snakeKey] = toSnake(value as object);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

export function createTransactionsModule(client: ReturnType<typeof createHttpClient>): TransactionsModule {
  return {
    async charge(request) {
      const body: Record<string, unknown> = {
        payment_type: request.paymentType,
        transaction_details: {
          order_id: request.transactionDetails.orderId,
          gross_amount: request.transactionDetails.grossAmount,
        },
      };

      if (request.itemDetails) {
        body.item_details = request.itemDetails.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
          brand: item.brand,
          category: item.category,
          merchant_name: item.merchantName,
        }));
      }

      if (request.customerDetails) {
        body.customer_details = toSnake(request.customerDetails);
      }

      switch (request.paymentType) {
        case "credit_card":
          body.token_id = request.tokenId;
          if (request.bank) body.bank = request.bank;
          if (request.installment) body.installment = request.installment;
          if (request.saveCard !== undefined) body.save_card = request.saveCard;
          if (request.type) body.type = request.type;
          if (request.authToken) body.auth = { authentication_id: request.authToken };
          break;
        case "bank_transfer":
          body.bank_transfer = toSnake(request.bankTransfer);
          break;
        case "echannel":
          body.echannel = toSnake(request.echannel);
          break;
        case "qris":
          if (request.qris) body.qris = toSnake(request.qris);
          break;
        case "gopay":
          if (request.goPay) body.gopay = toSnake(request.goPay);
          break;
        case "cstore":
          body.cstore = toSnake(request.cstore);
          break;
      }

      if (request.expiry) body.expiry = toSnake(request.expiry);
      if (request.customField1) body.custom_field1 = request.customField1;
      if (request.customField2) body.custom_field2 = request.customField2;
      if (request.customField3) body.custom_field3 = request.customField3;

      return client.request<ChargeResponse>("/charge", "POST", body, "core");
    },

    async status(orderId) {
      return client.request<TransactionStatusResponse>("/" + orderId + "/status", "GET", undefined, "core");
    },

    async cancel(orderId) {
      return client.request<TransactionStatusResponse>("/" + orderId + "/cancel", "POST", undefined, "core");
    },

    async expire(orderId) {
      return client.request<TransactionStatusResponse>("/" + orderId + "/expire", "POST", undefined, "core");
    },

    async approve(orderId) {
      return client.request<TransactionStatusResponse>("/" + orderId + "/approve", "POST", undefined, "core");
    },

    async deny(orderId) {
      return client.request<TransactionStatusResponse>("/" + orderId + "/deny", "POST", undefined, "core");
    },

    async refund(orderId, request) {
      return client.request<RefundResponse>("/" + orderId + "/refund/" + request.refundKey, "POST", {
        amount: request.amount,
        reason: request.reason,
      }, "core");
    },

    async statusById(transactionId) {
      return client.request<TransactionStatusResponse>("/" + transactionId + "/status", "GET", undefined, "core");
    },
  };
}