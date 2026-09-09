"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReviewService } from "@/services/review.service";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  IBookReviewsResponse,
  ICreateBookReviewPayload,
  ICreateServiceReviewPayload,
  IServiceReviewsResponse,
  IUpdateReviewPayload,
} from "@/types/review";

export const useGetBookReviews = (bookId?: number | string) => {
  return useQuery<IBookReviewsResponse>({
    queryKey: ["bookReviews", bookId],
    queryFn: async () => {
      if (!bookId) {
        return {
          bookId: 0,
          totalReviews: 0,
          averageRating: 0,
          reviews: [],
        };
      }
      return await ReviewService.getBookReviews(bookId);
    },
    enabled: Boolean(bookId),
    staleTime: 30 * 1000,
  });
};

export const useCreateBookReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateBookReviewPayload) => {
      return ReviewService.createBookReview(payload);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookReviews", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["bookReviews", String(variables.bookId)] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book", String(variables.bookId)] });
      toast.success("Thank you! Your review and rating have been submitted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          "Failed to submit review. Please check the review permissions and try again."
        )
      );
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: number | string;
      payload: IUpdateReviewPayload;
      bookId?: number;
    }) => {
      return ReviewService.updateReview(reviewId, payload);
    },
    onSuccess: (_, variables) => {
      if (variables.bookId) {
        queryClient.invalidateQueries({ queryKey: ["bookReviews", variables.bookId] });
        queryClient.invalidateQueries({ queryKey: ["bookReviews", String(variables.bookId)] });
      }
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Review updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update review."));
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
    }: {
      reviewId: number | string;
      bookId?: number;
    }) => {
      return ReviewService.deleteReview(reviewId);
    },
    onSuccess: (_, variables) => {
      if (variables.bookId) {
        queryClient.invalidateQueries({ queryKey: ["bookReviews", variables.bookId] });
        queryClient.invalidateQueries({ queryKey: ["bookReviews", String(variables.bookId)] });
      }
      queryClient.invalidateQueries({ queryKey: ["bookReviews"] });
      queryClient.invalidateQueries({ queryKey: ["serviceReviews"] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Review removed successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete review."));
    },
  });
};

export const useGetServiceReviews = () => {
  return useQuery<IServiceReviewsResponse>({
    queryKey: ["serviceReviews"],
    queryFn: async () => {
      return await ReviewService.getServiceReviews();
    },
    staleTime: 30 * 1000,
  });
};

export const useGetAllReviews = () => {
  return useQuery({
    queryKey: ["allReviews"],
    queryFn: async () => {
      return await ReviewService.getAllReviews();
    },
    staleTime: 30 * 1000,
  });
};

export const useCreateServiceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateServiceReviewPayload) => {
      return ReviewService.createServiceReview(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceReviews"] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      toast.success("Thank you for your valuable feedback!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit feedback."));
    },
  });
};

