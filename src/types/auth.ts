export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SHIFTER" | "MEMBER";

export type UserStatus =
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

export type PaymentMethod = "CASH" | "ONLINE";

export interface IUser {
  id: string | number;
  email: string;
  phone?: string;
  phoneNumber?: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
  studentOrVoterId?: string;
  institution?: string;
  department?: string;
  session?: string;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  membershipStartedAt?: string;
  membershipExpiresAt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  studentOrVoterId: string;
  institution?: string;
  department?: string;
  session?: string;
  paymentMethod?: PaymentMethod;
}

export interface IAuthResponseData {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user: IUser;
}

export interface IAuthResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: IAuthResponseData;
}

export interface IJwtPayload {
  userId: number | string;
  id?: number | string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  exp?: number;
  iat?: number;
}
