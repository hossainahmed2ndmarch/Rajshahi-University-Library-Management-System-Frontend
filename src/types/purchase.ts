import { IBook } from "./book";
import { IUser, PaymentMethod } from "./auth";

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface IPurchaseItem {
  bookId: number;
  quantity: number;
  unitPrice: number;
  book?: IBook;
}

export interface IPurchase {
  id: string | number;
  transactionId?: string;
  userId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  bookId?: number;
  book?: IBook;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items?: IPurchaseItem[];
  user?: IUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateMemberPurchasePayload {
  items: Array<{
    bookId: number | string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  /** Required — delivery address captured in Step 2 of checkout */
  shippingAddress: string;
  customerPhone?: string;
  customerName?: string;
}

export interface ICreateGuestPurchasePayload {
  items: Array<{
    bookId: number | string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  /** Required — delivery address captured in Step 2 of checkout */
  shippingAddress: string;
  guestName: string;
  guestPhone: string;
  /** Required for guest verification, tracking portal & cancellation */
  guestEmail: string;
}

export interface IGuestOrdersLookupPayload {
  email: string;
  phone?: string;
  transactionId?: string;
}

export interface IGuestCancelOrderPayload {
  transactionId: string;
  email: string;
  reason?: string;
}

export interface ICancelMemberPurchasePayload {
  purchaseId: number | string;
  reason?: string;
}

export interface ICreatePOSSalePayload {
  buyerType: "MEMBER" | "GUEST";
  memberId?: number | string;
  studentOrVoterId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  items?: Array<{
    bookId: number | string;
    quantity: number;
  }>;
  bookId?: number | string;
  quantity?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}


