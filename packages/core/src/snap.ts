import type { SnapTransactionRequest, SnapTransactionResponse } from "./types";
import type { createHttpClient } from "./http";

export interface SnapModule {
  createTransaction(request: SnapTransactionRequest): Promise<SnapTransactionResponse>;
}

export function createSnapModule(client: ReturnType<typeof createHttpClient>): SnapModule {
  return {
    async createTransaction(request) {
      const body: Record<string, unknown> = {
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
        const cd = request.customerDetails;
        body.customer_details = {
          first_name: cd.firstName,
          last_name: cd.lastName,
          email: cd.email,
          phone: cd.phone,
          billing_address: cd.billingAddress,
          shipping_address: cd.shippingAddress,
        };
      }

      if (request.creditCard) {
        body.credit_card = request.creditCard;
      }

      if (request.bankTransfer) {
        body.bank_transfer = request.bankTransfer;
      }

      if (request.echannel) {
        body.echannel = request.echannel;
      }

      if (request.goPay) {
        body.gopay = request.goPay;
      }

      if (request.qris) {
        body.qris = request.qris;
      }

      if (request.cstore) {
        body.cstore = request.cstore;
      }

      if (request.expiry) {
        body.expiry = request.expiry;
      }

      if (request.enabledPayments) {
        body.enabled_payments = request.enabledPayments;
      }

      if (request.customField1) body.custom_field1 = request.customField1;
      if (request.customField2) body.custom_field2 = request.customField2;
      if (request.customField3) body.custom_field3 = request.customField3;
      if (request.metadata) body.metadata = request.metadata;

      return client.request<SnapTransactionResponse>("/transactions", "POST", body, "snap");
    },
  };
}