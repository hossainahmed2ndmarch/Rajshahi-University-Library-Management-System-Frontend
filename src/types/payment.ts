import { IUser } from "./auth";

/**
 * PaymentStatus — mirrors Prisma PaymentStatus enum exactly.
 * Duplicated here to avoid circular imports from purchase.ts.
 */
export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

/**
 * PaymentMethod — mirrors Prisma PaymentMethod enum.
 */
export type PaymentMethod = "CASH" | "ONLINE";

/**
 * IPayment — aligned to Prisma Payment model (table: payments).
 * This model records membership fee payments via SSLCommerz or Cash.
 */
export interface IPayment {
  id: number;
  /** SSLCommerz transaction ID — globally unique */
  transactionId: string;
  userId: number;
  user?: IUser;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload for POST /payments/initiate-membership
 * Auth required: MEMBER, ADMIN, SUPER_ADMIN
 */
export interface IInitiateMembershipPaymentPayload {
  amount?: number;
}

/**
 * SSLCommerz IPN / callback payload shape.
 * Received at POST /payments/success, /fail, /cancel, /ipn.
 */
export interface ISSLCommerzCallback {
  tran_id?: string;
  val_id?: string;
  amount?: string;
  card_type?: string;
  store_amount?: string;
  bank_tran_id?: string;
  status?: "VALID" | "VALIDATED" | "INVALID" | "FAILED" | "CANCELLED" | string;
  tran_date?: string;
  currency?: string;
  card_issuer?: string;
  card_brand?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
}
