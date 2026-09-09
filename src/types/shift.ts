export type ShiftStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ShiftDutySlot = "MORNING" | "AFTERNOON" | "EVENING" | "CUSTOM";

export type NotificationChannel = "EMAIL" | "SMS" | "SOCIAL_MEDIA" | "ALL";

export type SocialPlatform = "WHATSAPP" | "MESSENGER" | "TELEGRAM";

export interface IShift {
  id: string | number;
  shifterId: string | number;
  shifterName?: string;
  shifter?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  status: ShiftStatus;
  startTime: string;
  endTime?: string;

  // Cash Accountability
  openingCash: number;
  startingCash?: number;
  cashCollected?: number;
  totalCashCollected?: number;
  closingCash?: number;
  endingCash?: number;

  // Operational Logs & Handover
  tasksCompleted?: string;
  handoverNotes?: string;
  notes?: string;

  // Supervisor Verification
  verifiedById?: number;
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
  };

  expectedCash?: number;
  cashVariance?: number;
  totalTransactions?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface IStartShiftPayload {
  openingCash: number;
  notes?: string;
}

export interface IEndShiftPayload {
  closingCash: number;
  cashCollected?: number;
  tasksCompleted: string;
  handoverNotes?: string;
}

export interface IScheduleShiftPayload {
  startTime: string;
  endTime?: string;
  shiftSlotName?: string;
  openingCash?: number;
  notes?: string;
  notifyRecipients?: "ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN" | string[] | number[];
  notificationMethod?: NotificationChannel;
  socialPlatform?: SocialPlatform;
}

export interface ICancelShiftPayload {
  reason: string;
  notifyRecipients?: "ALL" | "SHIFTER" | "ADMIN" | "SUPER_ADMIN" | string[] | number[];
  notificationMethod?: NotificationChannel;
  socialPlatform?: SocialPlatform;
}

export interface IShiftResponse {
  success: boolean;
  message?: string;
  data: IShift | null;
}
