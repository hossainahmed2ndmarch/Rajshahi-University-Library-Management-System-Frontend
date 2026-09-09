import { IBook } from "./book";
import { IUser } from "./auth";

export type BorrowStatus = "PENDING" | "APPROVED" | "RETURNED" | "REJECTED" | "OVERDUE";

export interface IBorrow {
  id: string | number;
  userId: number;
  bookId: number;
  status: BorrowStatus;
  /** Backend canonical name: requestedAt */
  requestedAt?: string;
  /** @deprecated Use requestedAt — kept for local seed data backward compat */
  borrowDate?: string;
  dueDate?: string;
  approvedAt?: string;
  approvedById?: number;
  approvedBy?: { id: number; name: string; role: string };
  /** Backend canonical name: returnedAt */
  returnedAt?: string;
  /** @deprecated Use returnedAt — kept for local seed data backward compat */
  returnDate?: string;
  /** ID of the staff member (Admin/Super Admin/Shifter) who processed the return */
  returnedById?: number;
  /** Staff member (Admin/Super Admin/Shifter) who was present when book was returned */
  returnedBy?: { id: number; name: string; role: string };
  fineAmount?: number;
  user?: IUser;
  book?: IBook;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateBorrowPayload {
  bookId: number | string;
  dueDate?: string;
}

export interface IIssueBorrowPayload {
  bookId: number | string;
  memberId?: number | string;
  studentOrVoterId?: string;
  memberPhone?: string;
  memberEmail?: string;
  dueDate?: string;
  notes?: string;
}
