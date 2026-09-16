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

  shiftSlotName?: string;
  actionToken?: string;
  isOfflineRecord?: boolean;
  rescheduledTo?: string;

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
  shifterId?: number;
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

export interface IShifterSchedule {
  id: number;
  shifterId: number;
  shifter?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  dayOfWeek: number; // 0=Sun … 6=Sat
  dayName: string;   // Bengali (e.g. শনিবার)
  dayEn: string;     // English (e.g. Saturday)
  slot: string;      // 'asr_maghrib' | 'maghrib_isha' | 'custom'
  slotName: string;  // 'আসর – মাগরিব'
  startTime: string; // '15:30'
  endTime: string;   // '18:15'
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRescheduleShiftPayload {
  newStartTime: string;
  newEndTime?: string;
  reason?: string;
  notifyRecipients?: 'ALL' | 'SHIFTER' | 'ADMIN' | 'SUPER_ADMIN';
  notificationMethod?: 'EMAIL' | 'SMS' | 'ALL';
}

export interface ICompleteOfflinePayload {
  openingCash: number;
  closingCash: number;
  cashCollected: number;
  tasksCompleted?: string;
  handoverNotes?: string;
  isOfflineRecord?: boolean;
}

export interface ICreateSchedulePayload {
  shifterId: number;
  dayOfWeek: number;
  dayName: string;
  dayEn: string;
  slot: string;
  slotName: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  notes?: string;
}

export interface IEmailActionPayload {
  token: string;
  action: 'START' | 'CANCEL';
  cancelReason?: string;
  openingCash?: number;
}

