import { IBook } from "./book";
import { IUser } from "./auth";

export interface IBookReview {
  id: number;
  rating: number;
  comment?: string;
  userId?: number | null;
  bookId: number | string;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  isAnonymous?: boolean;
  user?: IUser | null;
  book?: IBook;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookReviewsResponse {
  bookId: number | string;
  totalReviews: number;
  averageRating: number;
  reviews: IBookReview[];
}

export interface ICreateBookReviewPayload {
  bookId: number | string;
  rating: number;
  comment?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  isAnonymous?: boolean;
}

export interface IServiceReview {
  id: number;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  userId?: number;
  user?: IUser;
  reviewerName?: string;
  reviewerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IServiceReviewsResponse {
  totalReviews: number;
  averageRating: number;
  reviews: IServiceReview[];
}

export interface ICreateServiceReviewPayload {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  reviewerName?: string;
  reviewerEmail?: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}
