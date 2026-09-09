import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  IBookReview,
  IBookReviewsResponse,
  ICreateBookReviewPayload,
  ICreateServiceReviewPayload,
  IServiceReview,
  IServiceReviewsResponse,
  IUpdateReviewPayload,
} from "@/types/review";

export const ReviewService = {
  /**
   * Create or update a review for a book.
   * - BUYABLE & HYBRID books: anyone (guest or authenticated) can review.
   * - BORROWABLE books: only authenticated MEMBER, SHIFTER, ADMIN, SUPER_ADMIN can review.
   */
  createBookReview: async (payload: ICreateBookReviewPayload): Promise<IBookReview> => {
    const response = await axiosInstance.post<ApiResponse<IBookReview>>("/reviews/book", payload);
    return response.data?.data;
  },

  /**
   * Fetch all reviews and average rating for a book.
   */
  getBookReviews: async (bookId: number | string): Promise<IBookReviewsResponse> => {
    const response = await axiosInstance.get<ApiResponse<IBookReviewsResponse>>(
      `/reviews/book/${bookId}`
    );
    return (
      response.data?.data || {
        bookId: Number(bookId),
        totalReviews: 0,
        averageRating: 0,
        reviews: [],
      }
    );
  },

  /**
   * Update an existing review by review ID.
   */
  updateReview: async (
    reviewId: number | string,
    payload: IUpdateReviewPayload
  ): Promise<IBookReview> => {
    const response = await axiosInstance.patch<ApiResponse<IBookReview>>(
      `/reviews/${reviewId}`,
      payload
    );
    return response.data?.data;
  },

  /**
   * Delete an existing review by review ID.
   */
  deleteReview: async (reviewId: number | string): Promise<void> => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },

  /**
   * Submit service/library feedback.
   */
  createServiceReview: async (
    payload: ICreateServiceReviewPayload
  ): Promise<IServiceReview> => {
    const response = await axiosInstance.post<ApiResponse<IServiceReview>>(
      "/reviews/service",
      payload
    );
    return response.data?.data;
  },

  /**
   * Fetch all service reviews with average rating.
   */
  getServiceReviews: async (): Promise<IServiceReviewsResponse> => {
    const response = await axiosInstance.get<ApiResponse<IServiceReviewsResponse>>(
      "/reviews/service"
    );
    return (
      response.data?.data || {
        totalReviews: 0,
        averageRating: 0,
        reviews: [],
      }
    );
  },

  /**
   * Fetch all reviews (book reviews + service reviews) for Admin / Super Admin moderation.
   */
  getAllReviews: async (): Promise<{
    totalBookReviews: number;
    totalServiceReviews: number;
    bookReviews: IBookReview[];
    serviceReviews: IServiceReview[];
  }> => {
    const response = await axiosInstance.get<
      ApiResponse<{
        totalBookReviews: number;
        totalServiceReviews: number;
        bookReviews: IBookReview[];
        serviceReviews: IServiceReview[];
      }>
    >("/reviews/all");
    return (
      response.data?.data || {
        totalBookReviews: 0,
        totalServiceReviews: 0,
        bookReviews: [],
        serviceReviews: [],
      }
    );
  },
};

