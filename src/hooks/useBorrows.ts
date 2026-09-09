"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BorrowService } from "@/services/borrow.service";
import { getErrorMessage } from "@/lib/errorUtils";
import { IBorrow, ICreateBorrowPayload } from "@/types/borrow";

export const useCreateBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateBorrowPayload): Promise<IBorrow> => {
      return BorrowService.createBorrow(payload);
    },
    onSuccess: (borrow) => {
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(
        `Borrow request #${borrow.id} submitted! Status is PENDING approval by library staff.`
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit borrow request. Please check your account status."));
    },
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: import("@/types/borrow").IIssueBorrowPayload): Promise<IBorrow> => {
      return await BorrowService.issueBook(payload);
    },
    onSuccess: (borrow) => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      toast.success(`Book "${borrow.book?.title || 'Book'}" successfully issued to ${borrow.user?.name || 'member'}!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to issue book at counter desk."));
    },
  });
};

export const useApproveBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowId: string | number) => {
      return BorrowService.approveBorrow(borrowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Borrow request approved! Dynamic due date calculated (15 pages/day).");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve borrow request."));
    },
  });
};

export const useRejectBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowId: string | number) => {
      return BorrowService.rejectBorrow(borrowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Borrow request rejected.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject borrow request."));
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ borrowId, fineAmount }: { borrowId: string | number; fineAmount?: number }) => {
      return await BorrowService.returnBook(borrowId, fineAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book marked returned and library inventory updated!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to process return."));
    },
  });
};

export const useCheckOverdueBorrows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await BorrowService.checkOverdueBorrows();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      toast.success(
        `Overdue check complete! ${data.data?.totalChecked ?? 0} overdue items audited and alerts dispatched.`
      );
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to run overdue audit."));
    },
  });
};

export const useGetMyBorrows = () => {
  return useQuery<IBorrow[]>({
    queryKey: ["myBorrows"],
    queryFn: () => BorrowService.getMyBorrows(),
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useGetAllBorrows = (params?: Record<string, unknown>) => {
  return useQuery<IBorrow[]>({
    queryKey: ["borrows", params],
    queryFn: async (): Promise<IBorrow[]> => {
      try {
        return await BorrowService.getAllBorrows(params);
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
};

export const useDeleteBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (borrowId: string | number) => {
      return await BorrowService.deleteBorrow(borrowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["myBorrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Borrow record deleted successfully from audit logs.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete borrow record."));
    },
  });
};

