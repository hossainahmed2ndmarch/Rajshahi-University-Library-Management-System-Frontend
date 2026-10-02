export type RudcMemberType =
  | 'VOLUNTEER'
  | 'MEMBER'
  | 'EXECUTIVE_COMMITTEE'
  | 'SHURA_MEMBER'
  | 'ALUMNI';

export type RudcApplicationStatus =
  | 'PENDING_REVIEW'
  | 'INTERVIEW_CALLED'
  | 'INTERVIEW_COMPLETED'
  | 'APPROVED'
  | 'REJECTED';

export type AccommodationType = 'HALL' | 'MESS' | 'HOME';

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export type IyanotPaymentMethod = 'ONLINE' | 'CASH_OFFLINE';

export type IyanotStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface IRudcApplyForm {
  name: string;
  email: string;
  phone: string;
  password?: string;
  department: string;
  faculty: string;
  studentOrVoterId: string;
  whatsappNumber: string;
  bloodGroup: BloodGroup;
  skills: string[];
  accommodationType: AccommodationType;
  accommodationName: string;
  permanentAddress: string;
  isAffiliatedWithOther: boolean;
  otherOrgName?: string;
  rudcTermsAccepted: boolean;
}

export interface IRudcMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  studentOrVoterId: string;
  department?: string | null;
  faculty?: string | null;
  whatsappNumber?: string | null;
  bloodGroup?: BloodGroup | null;
  skills: string[];
  accommodationType?: AccommodationType | null;
  accommodationName?: string | null;
  permanentAddress?: string | null;
  isAffiliatedWithOther?: boolean;
  otherOrgName?: string | null;
  isRudcMember?: boolean;
  rudcTermsAccepted?: boolean;
  rudcMemberType?: RudcMemberType | null;
  rudcStatus?: RudcApplicationStatus | null;
  rudcJoinedAt?: string | null;
  interviewDate?: string | null;
  interviewNotes?: string | null;
  interviewEmailSentAt?: string | null;
  supervisorId?: number | null;
  supervisor?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    rudcMemberType?: RudcMemberType;
  } | null;
  supervisedVolunteers?: {
    id: number;
    name: string;
    phone: string;
    department?: string | null;
    rudcMemberType?: RudcMemberType;
    rudcStatus?: RudcApplicationStatus;
  }[];
  rudcTeams?: {
    id: number;
    role?: string | null;
    team: IRudcTeam;
  }[];
  iyanotPayments?: IRudcIyanot[];
  _count?: {
    supervisedVolunteers?: number;
    iyanotPayments?: number;
  };
  createdAt?: string;
}

export interface IRudcTeam {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  members?: {
    id: number;
    userId: number;
    role?: string | null;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      avatarUrl?: string | null;
      rudcMemberType?: RudcMemberType;
      rudcStatus?: RudcApplicationStatus;
    };
  }[];
  _count?: {
    members?: number;
  };
}

export interface IRudcIyanot {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    studentOrVoterId?: string;
    department?: string | null;
    rudcMemberType?: RudcMemberType;
  };
  month: number;
  year: number;
  amount: number;
  status: IyanotStatus;
  paymentMethod: IyanotPaymentMethod;
  collectedById?: number | null;
  collectedBy?: {
    id: number;
    name: string;
    role: string;
  } | null;
  transactionId?: string | null;
  receiptNo?: string | null;
  remarks?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface IRudcStats {
  volunteersCount: number;
  permanentMembersCount: number;
  totalMembers: number;
  teamsCount: number;
  iyanotTotal: number;
}
