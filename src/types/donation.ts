/**
 * Canonical Prisma DonationStatus values (all 7 states).
 * Previously missing: SCHEDULED, CATALOGED, CANCELLED.
 */
export type DonationStatus =
  | "PENDING"
  | "APPROVED"
  | "SCHEDULED"
  | "RECEIVED"
  | "CATALOGED"
  | "REJECTED"
  | "CANCELLED";

/**
 * DonationMethod mirrors Prisma DonationMethod enum.
 */
export type DonationMethod = "LIBRARY_DROP_OFF" | "PICKUP" | "COURIER";

/**
 * IDonation — shape returned by GET /donations and related endpoints.
 * Fields are aligned to the Prisma Donation model (table: donations).
 */
export interface IDonation {
  id: string;
  /** Prisma field: bookTitle */
  bookTitle?: string;
  /** Prisma field: author */
  author?: string;
  /** Prisma field: category */
  category?: string;
  /** Prisma field: quantity */
  quantity: number;
  /** Prisma field: method */
  method?: DonationMethod;
  /** Prisma field: isAnonymous */
  isAnonymous?: boolean;
  /** Prisma field: status — full 7-value enum */
  status: DonationStatus;
  // Donor identity fields
  donorName?: string;
  donorEmail?: string;
  /** Prisma canonical: contactPhone */
  contactPhone?: string;
  /** @deprecated Use contactPhone — backend field is contactPhone */
  donorPhone?: string;
  /** Prisma canonical: donorNote */
  donorNote?: string;
  /** @deprecated Use donorNote — backend field is donorNote */
  notes?: string;
  /** Prisma field: pickupAddress */
  pickupAddress?: string;
  /** Prisma field: catalogedBookId — set after CATALOGED status */
  catalogedBookId?: number;
  // Relation IDs
  donorId?: number;
  // Relation objects
  donor?: { id: number; name: string; email?: string };
  receivedBy?: { id: number; name: string; email?: string; role?: string };
  catalogedBook?: { id: number; title: string; isbn: string; locationCell?: string; borrowStock?: number };
  // Tracking timestamps
  scheduledAt?: string;
  receivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only / legacy
  /** @deprecated Not a Prisma field — frontend only */
  donationCode?: string;
  /** @deprecated Not a Prisma field — no rejectionReason column in DB */
  rejectionReason?: string;
  /** @deprecated Not a Prisma field */
  locationCell?: string;
  /** @deprecated Not a Prisma field */
  condition?: string;
}

/**
 * Payload sent when creating a new donation (POST /donations).
 * Works for both guest (donorName/donorEmail/contactPhone) and member (donorId extracted from JWT).
 */
export interface IDonationPayload {
  bookTitle: string;
  author?: string;
  category?: string;
  quantity?: number;
  method?: DonationMethod;
  isAnonymous?: boolean;
  donorName?: string;
  donorEmail?: string;
  /** Prisma canonical field name */
  contactPhone?: string;
  /** @deprecated Use contactPhone */
  donorPhone?: string;
  /** Prisma canonical field name */
  donorNote?: string;
  /** @deprecated Use donorNote */
  notes?: string;
  pickupAddress?: string;
  scheduledAt?: string;
  condition?: string;
}

export interface IApproveDonationPayload {
  id: string | number;
  locationCell?: string;
  assignedCategory?: string;
  pages?: number;
  isbn?: string;
  borrowStock?: number;
  sellStock?: number;
}

/**
 * Reject donation via PATCH /donations/:id/approve with status override,
 * since no dedicated /reject route exists in the backend.
 */
export interface IRejectDonationPayload {
  id: string;
  rejectionReason?: string;
}

export interface ICreatePOSDonationPayload {
  donorType?: "MEMBER" | "GUEST";
  memberId?: number | string;
  donorName?: string;
  donorEmail?: string;
  contactPhone?: string;
  isAnonymous?: boolean;
  donorNote?: string;
  condition?: string;
  bookTitle: string;
  author?: string;
  category?: string;
  quantity?: number;
  autoCatalog?: boolean;
  locationCell?: string;
  isbn?: string;
  pages?: number;
}

export interface IDonationResponse {
  success: boolean;
  message?: string;
  data?: IDonation | null;
}
