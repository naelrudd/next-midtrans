export type MidtransEnvironment = "sandbox" | "production";

export type PaymentType =
  | "credit_card"
  | "bank_transfer"
  | "echannel"
  | "qris"
  | "gopay"
  | "shopeepay"
  | "cstore"
  | "bca_klikpay"
  | "bca_klikbca"
  | "bri_epay"
  | "cimb_clicks"
  | "danamon_online"
  | "akulaku"
  | "kredivo"
  | "other";

export type TransactionStatus =
  | "authorize"
  | "capture"
  | "settlement"
  | "deny"
  | "pending"
  | "cancel"
  | "refund"
  | "partial_refund"
  | "chargeback"
  | "partial_chargeback"
  | "expire"
  | "failure";

export type FraudStatus = "accept" | "deny" | "challenge";

export type Bank = "bca" | "bni" | "bri" | "mandiri" | "permata" | "cimb";

export interface ItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
  brand?: string;
  category?: string;
  merchantName?: string;
}

export interface CustomerDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface TransactionDetails {
  orderId: string;
  grossAmount: number;
}

export interface Expiry {
  startTime?: string;
  unit: "minutes" | "hours" | "days";
  duration: number;
}

export interface CreditCardOptions {
  secure?: boolean;
  channel?: "migs" | "mpgs" | "rba";
  bank?: "bca" | "mandiri" | "bni" | "cimb" | "maybank" | "bri";
  installment?: { duration: number; count: number }[];
  whitelistBins?: string[];
  blacklistBins?: string[];
  saveCard?: boolean;
  type?: "authorize" | "authorize_capture";
  point?: boolean;
}

export interface BankTransferOptions {
  bank: Bank;
  vaNumber?: string;
  freeText?: {
    en: string;
    id?: string;
  }[];
  bca?: { subCompanyCode?: string };
  permata?: { recipientName?: string };
  bni?: { dueDate?: string };
  mandiri?: { billInfo1?: string; billInfo2?: string };
}

export interface EchannelOptions {
  billInfo1?: string;
  billInfo2?: string;
}

export interface QrisOptions {
  acquirerBank?: string;
}

export interface CstoreOptions {
  store: string;
  message?: string;
  alfaMitra?: { alfaMitraVaNumber?: string };
}

export interface UopOptions {
  name?: string;
}

// ---- Create Transaction (Snap) ----

export interface SnapTransactionRequest {
  transactionDetails: TransactionDetails;
  itemDetails?: ItemDetail[];
  customerDetails?: CustomerDetails;
  creditCard?: CreditCardOptions;
  bankTransfer?: BankTransferOptions;
  echannel?: EchannelOptions;
  goPay?: { enableCallback?: boolean; callbackUrl?: string; accountId?: string };
  qris?: QrisOptions;
  cstore?: CstoreOptions;
  expiry?: Expiry;
  enabledPayments?: PaymentType[];
  customField1?: string;
  customField2?: string;
  customField3?: string;
  metadata?: Record<string, string>;
}

export interface SnapTransactionResponse {
  token: string;
  redirect_url: string;
}

// ---- Charge (Core API) ----

export type ChargeRequest =
  | CreditCardChargeRequest
  | BankTransferChargeRequest
  | EchannelChargeRequest
  | QrisChargeRequest
  | GoPayChargeRequest
  | CstoreChargeRequest;

interface BaseChargeRequest {
  transactionDetails: TransactionDetails;
  itemDetails?: ItemDetail[];
  customerDetails?: CustomerDetails;
  expiry?: Expiry;
  customField1?: string;
  customField2?: string;
  customField3?: string;
}

export interface CreditCardChargeRequest extends BaseChargeRequest {
  paymentType: "credit_card";
  tokenId: string;
  bank?: string;
  installment?: { duration: number; count: number };
  saveCard?: boolean;
  type?: "authorize" | "authorize_capture";
  authToken?: string;
}

export interface BankTransferChargeRequest extends BaseChargeRequest {
  paymentType: "bank_transfer";
  bankTransfer: BankTransferOptions;
}

export interface EchannelChargeRequest extends BaseChargeRequest {
  paymentType: "echannel";
  echannel: EchannelOptions;
}

export interface QrisChargeRequest extends BaseChargeRequest {
  paymentType: "qris";
  qris?: QrisOptions;
}

export interface GoPayChargeRequest extends BaseChargeRequest {
  paymentType: "gopay";
  goPay?: { enableCallback?: boolean; callbackUrl?: string; accountId?: string };
}

export interface CstoreChargeRequest extends BaseChargeRequest {
  paymentType: "cstore";
  cstore: CstoreOptions;
}

// ---- Charge response ----

export interface VaNumber {
  bank: string;
  va_number: string;
}

export interface PaymentAmount {
  paid_at: string;
  amount: string;
}

export interface ChargeResponse {
  status_code: string;
  status_message: string;
  transaction_id?: string;
  order_id: string;
  gross_amount: string;
  payment_type: PaymentType;
  transaction_time?: string;
  transaction_status?: TransactionStatus;
  fraud_status?: FraudStatus;
  pdf_url?: string;
  va_numbers?: VaNumber[];
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  qr_string?: string;
  deeplink_url?: string;
  qr_url?: string;
  actions?: { name: string; method: string; url: string }[];
  expiry_time?: string;
  currency?: string;
}

// ---- Transaction status ----

export interface TransactionStatusResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: PaymentType;
  transaction_time: string;
  transaction_status: TransactionStatus;
  fraud_status?: FraudStatus;
  signature_key: string;
  settlement_time?: string;
  expiry_time?: string;
  store?: string;
  va_numbers?: VaNumber[];
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  qr_string?: string;
  deeplink_url?: string;
  acquirer?: string;
  currency?: string;
  payment_amounts?: PaymentAmount[];
  actions?: { name: string; method: string; url: string }[];
  refund_amount?: string;
  refunds?: {
    refund_amount: string;
    reason: string;
    status: "pending" | "success" | "failure";
    refund_key: string;
  }[];
  metadata?: Record<string, unknown>;
}

// ---- Notifications (webhook) ----

export interface TransactionNotification {
  transaction_id: string;
  transaction_time: string;
  transaction_status: TransactionStatus;
  order_id: string;
  status_code: string;
  status_message: string;
  signature_key: string;
  payment_type: PaymentType;
  gross_amount: string;
  currency: string;
  merchant_id: string;
  fraud_status?: FraudStatus;
  settlement_time?: string;
  expiry_time?: string;
  store?: string;
  va_numbers?: VaNumber[];
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  qr_string?: string;
  deeplink_url?: string;
  acquirer?: string;
  payment_amounts?: PaymentAmount[];
  refund_amount?: string;
  refunds?: {
    refund_amount: string;
    reason: string;
    status: "pending" | "success" | "failure";
    refund_key: string;
  }[];
  metadata?: Record<string, unknown>;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

export interface MidtransErrorBody {
  status_code: string;
  status_message: string;
  id?: string;
}

export interface WebhookVerificationInput {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}

// ---- Refund ----

export interface RefundRequest {
  refundKey: string;
  amount?: number;
  reason: string;
}

export interface RefundResponse {
  status_code: string;
  status_message: string;
  order_id: string;
  refund_amount?: string;
  refund_key?: string;
  refund_status?: "pending" | "success" | "failure";
  refund_id?: string;
  vault?: string;
}